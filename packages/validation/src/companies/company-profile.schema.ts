import { z } from "zod";

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
  logoId: z.string().trim().optional(),
  logoUrl: z
    .string()
    .trim()
    .url("Invalid logo URL")
    .optional()
    .or(z.literal("")),
});

export type CompanyProfileUpdateInput = z.infer<
  typeof companyProfileUpdateSchema
>;
