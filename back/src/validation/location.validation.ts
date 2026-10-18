import { z } from "zod";

export const getLocationCitiesQuerySchema = z.object({
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Select a valid country"),
  q: z.preprocess(
    value => (value === "" ? undefined : value),
    z.string().trim().min(1).max(100).optional(),
  ),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
});
