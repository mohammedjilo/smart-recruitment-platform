import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { resolve } from "node:path";
import type { z } from "zod";
import { getCountries } from "@countrystatecity/countries";
import type { getLocationCitiesQuerySchema } from "../validation/location.validation";
import { AppError } from "../utils/appError.js";

export type GeoNamesPlace = {
  geonameId: number;
  name: string;
  asciiName: string;
  countryCode: string;
  admin1Code: string;
  admin1Name: string;
  admin2Code: string;
  admin2Name: string;
  population: number;
};

type LocationCitiesQuery = z.infer<typeof getLocationCitiesQuerySchema>;
type PlaceIndex = {
  byCountry: Map<string, GeoNamesPlace[]>;
  byId: Map<number, GeoNamesPlace>;
};

let placeIndex: PlaceIndex | undefined;

const datasetPaths = [
  resolve(__dirname, "../../data/geonames/cities500.json.gz"),
  resolve(__dirname, "../../../data/geonames/cities500.json.gz"),
  resolve(process.cwd(), "data/geonames/cities500.json.gz"),
];

const loadPlaceIndex = (): PlaceIndex => {
  if (placeIndex) return placeIndex;
  const path = datasetPaths.find(existsSync);
  if (!path) {
    throw new AppError(
      "The local geographic dataset is unavailable.",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }

  try {
    const places = JSON.parse(
      gunzipSync(readFileSync(path)).toString("utf8"),
    ) as GeoNamesPlace[];
    if (!Array.isArray(places) || places.length < 100_000) {
      throw new Error("GeoNames dataset failed its integrity check");
    }

    const byCountry = new Map<string, GeoNamesPlace[]>();
    const byId = new Map<number, GeoNamesPlace>();
    for (const place of places) {
      if (
        !Number.isSafeInteger(place.geonameId) ||
        !/^[A-Z]{2}$/.test(place.countryCode) ||
        !place.name
      ) {
        throw new Error("GeoNames dataset contains an invalid record");
      }
      if (byId.has(place.geonameId)) {
        throw new Error(`Duplicate GeoNames identifier: ${place.geonameId}`);
      }
      byId.set(place.geonameId, place);
      const countryPlaces = byCountry.get(place.countryCode) ?? [];
      countryPlaces.push(place);
      byCountry.set(place.countryCode, countryPlaces);
    }
    placeIndex = { byCountry, byId };
    return placeIndex;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "The local geographic dataset could not be loaded.",
      503,
      "SERVICE_UNAVAILABLE",
      undefined,
      { cause: error, source: "internal" },
    );
  }
};

export const searchLocationCities = async (query: LocationCitiesQuery) => {
  const index = loadPlaceIndex();
  const countryCode = query.countryCode.toUpperCase();
  const countries = await getCountries();
  if (!countries.some(country => country.iso2.toUpperCase() === countryCode)) {
    throw new AppError("Select a supported country.", 400, "VALIDATION_ERROR", {
      countryCode: "Select a supported country.",
    });
  }
  const needle = query.q?.trim().toLocaleLowerCase();
  const countryPlaces = index.byCountry.get(countryCode) ?? [];
  const matchingPlaces = needle
    ? countryPlaces
        .filter(
        place =>
          place.name.toLocaleLowerCase().includes(needle) ||
          place.asciiName.toLocaleLowerCase().includes(needle) ||
          place.admin1Name.toLocaleLowerCase().includes(needle) ||
          place.admin2Name.toLocaleLowerCase().includes(needle),
        )
        .sort((left, right) => {
          const leftNameMatch =
            left.name.toLocaleLowerCase().includes(needle) ||
            left.asciiName.toLocaleLowerCase().includes(needle);
          const rightNameMatch =
            right.name.toLocaleLowerCase().includes(needle) ||
            right.asciiName.toLocaleLowerCase().includes(needle);
          if (leftNameMatch !== rightNameMatch) {
            return leftNameMatch ? -1 : 1;
          }

          const leftPrefix =
            left.name.toLocaleLowerCase().startsWith(needle) ||
            left.asciiName.toLocaleLowerCase().startsWith(needle);
          const rightPrefix =
            right.name.toLocaleLowerCase().startsWith(needle) ||
            right.asciiName.toLocaleLowerCase().startsWith(needle);
          if (leftPrefix !== rightPrefix) return leftPrefix ? -1 : 1;
          return right.population - left.population;
        })
    : countryPlaces;

  const pageSize = query.limit;
  const start = (query.page - 1) * pageSize;
  return {
    places: matchingPlaces.slice(start, start + pageSize),
    pagination: {
      page: query.page,
      pageSize,
      totalCount: matchingPlaces.length,
    },
  };
};

export const getLocationCity = (
  geonameId: number,
  countryCode: string,
): GeoNamesPlace => {
  const place = loadPlaceIndex().byId.get(geonameId);
  if (!place || place.countryCode !== countryCode.toUpperCase()) {
    throw new AppError(
      "Select a valid city for the selected country.",
      400,
      "VALIDATION_ERROR",
      { cityGeonameId: "Select a valid city for the selected country." },
    );
  }
  return place;
};
