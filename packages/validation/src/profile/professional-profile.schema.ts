import { z } from "zod";
import { certificateSchema } from "./certificate.schema.js";
import { educationSchema } from "./education.schema.js";
import { experienceSchema } from "./experience.schema.js";
import { projectSchema } from "./project.schema.js";

export const professionalProfileSchema = z.object({
  jobTitle: z.string().trim().min(2, "Job title is required"),
  summary: z
    .string()
    .trim()
    .min(10, "Summary must be at least 10 characters")
    .optional()
    .nullable(),
  yearsOfExperience: z
    .number()
    .int()
    .min(0, "Years of experience must be non-negative"),
  cvPath: z
    .string()
    .trim()
    .url("CV path must be a valid URL")
    .optional()
    .nullable(),
  educations: z.array(educationSchema).optional(),
  experiences: z.array(experienceSchema).optional(),
  projects: z.array(projectSchema).optional(),
  certificates: z.array(certificateSchema).optional(),
});

export const updateProfessionalProfileSchema =
  professionalProfileSchema.partial();
export type ProfessionalProfileInput = z.infer<
  typeof professionalProfileSchema
>;
