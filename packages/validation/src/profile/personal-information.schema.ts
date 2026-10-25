import { z } from "zod";
import { cityNameSchema } from "../common/location.schema.js";
import { isValidDateOnly } from "../jobs/date-only.js";
import { dateOnlySchema } from "./common.schema.js";

export const personalInformationUpdateSchema = z.object({
  phone: z.string().trim().min(7, "Phone number must be at least 7 characters"),
  birthdate: dateOnlySchema.refine(isValidDateOnly, "Enter a valid date of birth"),
  country: z.string().trim().min(2, "Select a country"),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Select a valid country"),
  state: z.string().trim().optional().or(z.literal("")),
  stateCode: z.string().trim().optional().or(z.literal("")),
  city: cityNameSchema,
  cityGeonameId: z.coerce.number().int().positive("Select a city from the list"),
});

export type PersonalInformationUpdateInput = z.infer<
  typeof personalInformationUpdateSchema
>;
