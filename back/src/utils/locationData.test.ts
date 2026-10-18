import assert from "node:assert/strict";
import test from "node:test";
import {
  companyRegistrationSchema,
  userRegistrationSchema,
} from "@smart-recruitment/validation";
import {
  getAdminUsersQuerySchema,
  getAllCompaniesQuerySchema,
} from "../validation/admin.validation";
import { getCompanyUsersQuerySchema } from "../validation/company.validation";
import { getCompaniesQuerySchema } from "../validation/user.validation";
import {
  locationFilterSchema,
  normalizeLocationFilter,
  resolveLocation,
} from "./locationData";
import {
  getLocationCity,
  searchLocationCities,
} from "../services/locationData.service";

const aleppo = {
  country: "Syria",
  countryCode: "SY",
  city: "Aleppo",
  cityGeonameId: 170063,
};

const losAngeles = {
  country: "United States",
  countryCode: "US",
  city: "Los Angeles",
  cityGeonameId: 5368361,
};

test("GeoNames lookup returns bounded canonical cities, including Syrian places", async () => {
  const result = await searchLocationCities({
    countryCode: "SY",
    q: "Aleppo",
    page: 1,
    limit: 25,
  });
  assert.ok(result.places.some(place => place.geonameId === 170063));
  assert.equal(result.places[0]?.geonameId, 170063);
  assert.equal(result.places[0]?.name, "Aleppo");
  assert.equal(result.places[0]?.countryCode, "SY");
  assert.ok(result.places.length <= 25);

  const allSyria = await searchLocationCities({
    countryCode: "SY",
    page: 1,
    limit: 100,
  });
  assert.equal(allSyria.pagination.totalCount, 310);
});

test("geographic identifiers are stable per record and restricted to country", () => {
  assert.equal(getLocationCity(170063, "SY").name, "Aleppo");
  assert.throws(
    () => getLocationCity(170063, "US"),
    (error: { code?: string }) => error.code === "VALIDATION_ERROR",
  );
  assert.throws(
    () => getLocationCity(999_999_999, "SY"),
    (error: { code?: string }) => error.code === "VALIDATION_ERROR",
  );
});

test("registration schemas require a GeoNames selection", () => {
  const userInput = {
    role: "user",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex@example.test",
    password: "correct-password",
    phone: "1234567890",
    birthdate: "1995-01-01",
    ...aleppo,
  };
  const companyInput = {
    role: "company",
    companyName: "Example Company",
    slug: "example-company",
    email: "company@example.test",
    password: "correct-password",
    phone: "1234567890",
    location: "Aleppo, Syria",
    ...aleppo,
  };
  assert.equal(userRegistrationSchema.safeParse(userInput).success, true);
  assert.equal(companyRegistrationSchema.safeParse(companyInput).success, true);
  assert.equal(
    userRegistrationSchema.safeParse({
      ...userInput,
      cityGeonameId: undefined,
    }).success,
    false,
  );
});

test("registration resolves canonical place data and rejects mismatched selection", async () => {
  assert.deepEqual(await resolveLocation(aleppo), {
    country: "Syria",
    countryCode: "SY",
    state: "Aleppo",
    stateCode: "",
    city: "Aleppo",
    cityGeonameId: 170063,
  });
  await assert.rejects(
    () => resolveLocation({ ...aleppo, countryCode: "US" }),
    (error: { code?: string }) => error.code === "VALIDATION_ERROR",
  );
  await assert.rejects(
    () => resolveLocation({ ...aleppo, city: "Damascus" }),
    (error: { fieldErrors?: Record<string, string> }) =>
      error.fieldErrors?.city === "Select a city from the suggestions.",
  );
  await assert.rejects(
    () =>
      resolveLocation({
        ...aleppo,
        city: "Aleppo",
        cityGeonameId: 999_999_999,
      }),
    (error: { fieldErrors?: Record<string, string> }) =>
      error.fieldErrors?.cityGeonameId ===
      "Select a valid city for the selected country.",
  );
});

test("country-only and country-city filters validate and canonicalize", async () => {
  assert.equal(
    locationFilterSchema.safeParse({
      country: "Syria",
      countryCode: "SY",
    }).success,
    true,
  );
  assert.equal(
    locationFilterSchema.safeParse({
      ...aleppo,
    }).success,
    true,
  );
  assert.equal(
    locationFilterSchema.safeParse({
      countryCode: "SY",
      city: "Aleppo",
    }).success,
    false,
  );
  assert.deepEqual(
    await normalizeLocationFilter({
      country: " united states ",
      countryCode: "US",
    }),
    { country: "United States", countryCode: "US" },
  );
  assert.deepEqual(await normalizeLocationFilter(losAngeles), {
    ...losAngeles,
  });
  await assert.rejects(
    () =>
      normalizeLocationFilter({
        ...aleppo,
        countryCode: "US",
      }),
    (error: { code?: string }) => error.code === "VALIDATION_ERROR",
  );
});

test("all four search endpoints accept country-only and validated country-city filters", () => {
  for (const schema of [
    getCompaniesQuerySchema,
    getAllCompaniesQuerySchema,
    getCompanyUsersQuerySchema,
    getAdminUsersQuerySchema,
  ]) {
    assert.equal(schema.safeParse({ countryCode: "SY" }).success, true);
    assert.equal(schema.safeParse(aleppo).success, true);
    assert.equal(
      schema.safeParse({ countryCode: "SY", city: "Aleppo" }).success,
      false,
    );
  }
});
