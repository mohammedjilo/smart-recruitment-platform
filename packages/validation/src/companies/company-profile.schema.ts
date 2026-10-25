import { z } from "zod";
import { cityNameSchema } from "../common/location.schema.js";

export const companySlugSchema = z
  .string()
  .trim()
  .min(1, "Company slug is required")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid company slug");

export const companyProfileUpdateSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required").max(64),
  slug: companySlugSchema.optional(),
  email: z.string().trim().email("Invalid email address").optional(),
  phone: z.string().trim().min(7, "Phone number is required").optional(),
  description: z.string().trim().optional(),
  website: z
    .string()
    .trim()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),
  location: z.string().trim().optional(),
  country: z.preprocess(
    value => (value === "" ? undefined : value),
    z.string().trim().min(2).optional(),
  ),
  countryCode: z.preprocess(
    value => (value === "" ? undefined : value),
    z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/, "Select a valid country")
      .optional(),
  ),
  state: z.preprocess(
    value => (value === "" ? undefined : value),
    z.string().trim().optional(),
  ),
  stateCode: z.preprocess(
    value => (value === "" ? undefined : value),
    z.string().trim().optional(),
  ),
  city: z.preprocess(
    value => (value === "" ? undefined : value),
    cityNameSchema.optional(),
  ),
  cityGeonameId: z.preprocess(
    value => (value === "" ? undefined : value),
    z.coerce.number().int().positive().optional(),
  ),
  logoId: z.string().trim().optional(),
  logoUrl: z
    .string()
    .trim()
    .url("Invalid logo URL")
    .optional()
    .or(z.literal("")),
}).superRefine((input, context) => {
  const hasLocationSelection =
    input.country !== undefined ||
    input.countryCode !== undefined ||
    input.state !== undefined ||
    input.stateCode !== undefined ||
    input.city !== undefined ||
    input.cityGeonameId !== undefined;

  if (!hasLocationSelection) return;

  if (!input.country) {
    context.addIssue({
      code: "custom",
      path: ["country"],
      message: "Select a country.",
    });
  }
  if (!input.countryCode) {
    context.addIssue({
      code: "custom",
      path: ["countryCode"],
      message: "Select a valid country.",
    });
  }
  if (!input.city) {
    context.addIssue({
      code: "custom",
      path: ["city"],
      message: "Select a city from the suggestions.",
    });
  }
  if (!input.cityGeonameId) {
    context.addIssue({
      code: "custom",
      path: ["cityGeonameId"],
      message: "Select a city from the suggestions.",
    });
  }
});

export type CompanyProfileUpdateInput = z.infer<
  typeof companyProfileUpdateSchema
>;
