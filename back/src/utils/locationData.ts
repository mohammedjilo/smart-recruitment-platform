import { getCountries } from "@countrystatecity/countries";
import { cityNameSchema } from "@smart-recruitment/validation";
import { z } from "zod";
import { getLocationCity } from "../services/locationData.service";
import { AppError } from "./appError.js";

const cityGeonameIdSchema = z.preprocess(
  value => (value === "" ? undefined : value),
  z.coerce.number().int().positive().optional(),
);

export const locationFilterFields = {
  country: z.string().trim().min(1).optional(),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/)
    .optional(),
  state: z.string().trim().min(1).optional(),
  stateCode: z.string().trim().min(1).optional(),
  city: cityNameSchema.optional(),
  cityGeonameId: cityGeonameIdSchema,
};

export const validateLocationFilter = (
  location: LocationFilter,
  context: z.RefinementCtx,
) => {
  if ((location.state || location.stateCode) && !location.countryCode) {
    context.addIssue({
      code: "custom",
      path: ["countryCode"],
      message: "Country is required when filtering by region.",
    });
  }
  if ((location.city || location.cityGeonameId) && !location.countryCode) {
    context.addIssue({
      code: "custom",
      path: ["countryCode"],
      message: "Country is required when filtering by city.",
    });
  }
  if (location.city && !location.cityGeonameId) {
    context.addIssue({
      code: "custom",
      path: ["cityGeonameId"],
      message: "Select a city from the suggestions.",
    });
  }
};

export const locationFilterSchema = z
  .object(locationFilterFields)
  .superRefine(validateLocationFilter);

export type LocationFilter = z.infer<typeof locationFilterSchema>;

export type VerifiedLocation = {
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  cityGeonameId: number;
};

export const cityLocationPredicate = (
  cityGeonameId: number,
  city: string | undefined,
) => ({
  OR: [
    { cityGeonameId },
    ...(city
      ? [
          {
            cityGeonameId: null,
            city: { equals: city, mode: "insensitive" as const },
          },
        ]
      : []),
  ],
});

const normalize = (value: string) => value.trim().toLocaleLowerCase();

const findCountry = async (country: string | undefined, countryCode: string) => {
  const countries = await getCountries();
  const result = countries.find(
    candidate => candidate.iso2.toUpperCase() === countryCode.toUpperCase(),
  );
  if (
    !result ||
    (country && normalize(result.name) !== normalize(country))
  ) {
    throw new AppError("Select a supported country.", 400, "VALIDATION_ERROR", {
      country: "Select a supported country.",
    });
  }
  return result;
};

const findCountryByName = async (countryName: string) => {
  const countries = await getCountries();
  const country = countries.find(
    candidate => normalize(candidate.name) === normalize(countryName),
  );
  if (!country) {
    throw new AppError("Select a supported country.", 400, "VALIDATION_ERROR", {
      country: "Select a supported country.",
    });
  }
  return country;
};

const verifyCityName = (city: string | undefined, canonicalName: string) => {
  if (city && normalize(city) !== normalize(canonicalName)) {
    throw new AppError(
      "The selected city does not match the geographic record.",
      400,
      "VALIDATION_ERROR",
      { city: "Select a city from the suggestions." },
    );
  }
};

export const resolveLocation = async (
  input: LocationFilter & {
    country: string;
    countryCode: string;
    city: string;
    cityGeonameId: number;
  },
): Promise<VerifiedLocation> => {
  const country = await findCountry(input.country, input.countryCode);
  const city = getLocationCity(input.cityGeonameId, country.iso2);
  verifyCityName(input.city, city.name);

  return {
    country: country.name,
    countryCode: country.iso2,
    state: city.admin1Name,
    stateCode: "",
    city: city.name,
    cityGeonameId: city.geonameId,
  };
};

export const normalizeLocationFilter = async (
  input: LocationFilter,
): Promise<LocationFilter> => {
  if (!input.country && !input.countryCode) return input;

  const country = input.countryCode
    ? await findCountry(input.country, input.countryCode)
    : await findCountryByName(input.country!);
  if (!input.cityGeonameId) {
    return {
      ...input,
      country: country.name,
      countryCode: country.iso2,
    };
  }

  const city = getLocationCity(input.cityGeonameId, country.iso2);
  verifyCityName(input.city, city.name);
  return {
    ...input,
    country: country.name,
    countryCode: country.iso2,
    city: city.name,
    cityGeonameId: city.geonameId,
  };
};
