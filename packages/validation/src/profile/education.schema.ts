import { z } from "zod";
import { dateOnlySchema, optionalDateOnlySchema } from "./common.schema.js";

const educationBaseSchema = z.object({
  university: z.string().trim().min(2, "University is required").max(100),
  degree: z.string().trim().min(2, "Degree is required").max(50),
  major: z.string().trim().min(2, "Major is required").max(50),
  startDate: dateOnlySchema,
  endDate: optionalDateOnlySchema,
});

export const educationSchema = educationBaseSchema.refine(
  (value: unknown) => {
    const typedValue = value as z.infer<typeof educationBaseSchema>;
    if (typedValue.endDate == null) return true;
    return typedValue.endDate >= typedValue.startDate;
  },
  {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  }
);

export const updateEducationSchema = educationBaseSchema.partial();
export type EducationInput = z.infer<typeof educationSchema>;
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>;
