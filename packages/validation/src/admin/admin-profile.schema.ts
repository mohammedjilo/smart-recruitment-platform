import { z } from "zod";
import { cityNameSchema } from "../common/location.schema.js";

export const updateAdminProfileSchema = z
  .object({
    firstName: z.string().trim().min(2).max(80).optional(),
    lastName: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().min(7).max(30).optional(),
    country: z.string().trim().min(2).max(80).optional(),
    countryCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/)
      .optional(),
    state: z.string().trim().optional(),
    stateCode: z.string().trim().optional(),
    city: cityNameSchema.optional(),
    cityGeonameId: z.number().int().positive().optional(),
  })
  .superRefine((input, context) => {
    const locationProvided =
      input.country !== undefined ||
      input.countryCode !== undefined ||
      input.state !== undefined ||
      input.stateCode !== undefined ||
      input.city !== undefined ||
      input.cityGeonameId !== undefined;

    if (!locationProvided) return;

    if (!input.country || !input.countryCode) {
      context.addIssue({
        code: "custom",
        path: ["countryCode"],
        message: "Select a valid country.",
      });
    }
    if (!input.city || !input.cityGeonameId) {
      context.addIssue({
        code: "custom",
        path: ["cityGeonameId"],
        message: "Select a city from the list.",
      });
    }
  });

export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;
