import { z } from "zod";
import { roleValues } from "../common/enums.js";
import { cityNameSchema } from "../common/location.schema.js";

export const createAdminSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  phone: z.string().trim().min(7).max(30),
  country: z.string().trim().min(2).max(80),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Select a valid country"),
  state: z.string().trim().optional().or(z.literal("")),
  stateCode: z.string().trim().optional().or(z.literal("")),
  city: cityNameSchema,
  cityGeonameId: z.number().int().positive("Select a city from the list"),
  roleName: z.enum(roleValues),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
