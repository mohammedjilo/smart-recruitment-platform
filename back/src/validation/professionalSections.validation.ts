import { z } from "zod";

export const educationSchema = z.object({
  university: z.string().trim().min(2, "University is required"),
  degree: z.string().trim().min(2, "Degree is required"),
  major: z.string().trim().min(2, "Major is required"),
  startDate: z.string().datetime({ offset: true }).or(z.string().min(1)),
  endDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().min(1))
    .optional()
    .nullable(),
});

export const experienceSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required"),
  position: z.string().trim().min(2, "Position is required"),
  description: z.string().trim().optional().nullable(),
  startDate: z.string().datetime({ offset: true }).or(z.string().min(1)),
  endDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().min(1).optional().nullable())
    .optional()
    .nullable(),
});

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  description: z.string().trim().optional().nullable(),
});

export const certificateSchema = z.object({
  certificateName: z.string().trim().min(2, "Certificate name is required"),
  organization: z.string().trim().min(2, "Organization is required"),
});
