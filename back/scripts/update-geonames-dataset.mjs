import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { unzipSync } from "fflate";

const execFileAsync = promisify(execFile);
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(
  scriptDirectory,
  "../data/geonames/cities500.json.gz",
);
const sourceUrl = "https://download.geonames.org/export/dump/";
const temporaryDirectory = await mkdtemp(join(tmpdir(), "geonames-"));

try {
  const download = async (filename) => {
    const localArchive = process.env.GEONAMES_CITIES500_ARCHIVE;
    const path =
      filename === "cities500.zip" && localArchive
        ? resolve(localArchive)
        : join(temporaryDirectory, filename);

    if (!(filename === "cities500.zip" && localArchive)) {
      await execFileAsync("curl", [
        "--fail",
        "--location",
        "--silent",
        "--show-error",
        "--retry",
        "8",
        "--retry-all-errors",
        "--retry-delay",
        "1",
        "--continue-at",
        "-",
        "--output",
        path,
        `${sourceUrl}${filename}`,
      ]);
    }

    const content = await readFile(path);
    console.log(
      `Downloaded ${filename} (${content.length.toLocaleString()} bytes)`,
    );
    return content;
  };

  const parseCodeNames = (text, maxParts) => {
    const names = new Map();
    for (const line of text.split(/\r?\n/)) {
      if (!line) continue;
      const [code, name] = line.split("\t");
      if (code && name)
        names.set(code.split(".").slice(0, maxParts).join("."), name);
    }
    return names;
  };

  const [archive, admin1Text, admin2Text] = await Promise.all([
    download("cities500.zip"),
    download("admin1CodesASCII.txt"),
    download("admin2Codes.txt"),
  ]);
  const zipFiles = unzipSync(new Uint8Array(archive));
  const placesFile = Object.entries(zipFiles).find(([name]) =>
    name.endsWith("cities500.txt"),
  );
  if (!placesFile)
    throw new Error("GeoNames archive did not contain cities500.txt");

  const admin1Names = parseCodeNames(admin1Text.toString("utf8"), 2);
  const admin2Names = parseCodeNames(admin2Text.toString("utf8"), 3);
  const rows = new TextDecoder().decode(placesFile[1]).split(/\r?\n/);
  const places = [];

  for (const row of rows) {
    if (!row) continue;
    const fields = row.split("\t");
    const geonameId = Number(fields[0]);
    const name = fields[1]?.trim();
    const asciiName = fields[2]?.trim();
    const countryCode = fields[8]?.toUpperCase();
    const admin1Code = fields[10] ?? "";
    const admin2Code = fields[11] ?? "";

    if (
      fields[6] !== "P" ||
      !Number.isSafeInteger(geonameId) ||
      !name ||
      !countryCode
    ) {
      continue;
    }

    const admin1Key = `${countryCode}.${admin1Code}`;
    const admin2Key = `${admin1Key}.${admin2Code}`;
    places.push({
      geonameId,
      name,
      asciiName: asciiName || name,
      countryCode,
      admin1Code,
      admin1Name: admin1Names.get(admin1Key) ?? "",
      admin2Code,
      admin2Name: admin2Names.get(admin2Key) ?? "",
      population: Number(fields[14]) || 0,
    });
  }

  if (places.length < 100_000) {
    throw new Error(
      `Unexpectedly small GeoNames dataset: ${places.length} places`,
    );
  }
  if (!places.some((place) => place.countryCode === "SY")) {
    throw new Error(
      "GeoNames cities500 contains no populated places for Syria (SY)",
    );
  }

  places.sort(
    (a, b) =>
      a.countryCode.localeCompare(b.countryCode) ||
      a.name.localeCompare(b.name) ||
      a.admin1Name.localeCompare(b.admin1Name) ||
      b.population - a.population,
  );

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, gzipSync(Buffer.from(JSON.stringify(places))));
  console.log(
    `Generated ${places.length.toLocaleString()} populated places; Syria: ${places.filter((place) => place.countryCode === "SY").length.toLocaleString()}; file: ${outputPath}`,
  );
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
