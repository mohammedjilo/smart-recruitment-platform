import { z } from "zod";
import { dateOnlySchema, optionalDateOnlySchema } from "./common.schema.js";

const experienceBaseSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required").max(100),
  position: z.string().trim().min(2, "Position is required").max(100),
  description: z.string().trim().max(500).optional().nullable(),
  startDate: dateOnlySchema,
  endDate: optionalDateOnlySchema,
});

export const experienceSchema = experienceBaseSchema.refine(
  (value) => !value.endDate || value.endDate >= value.startDate,
  {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  }
);

export const updateExperienceSchema = experienceBaseSchema.partial();
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
