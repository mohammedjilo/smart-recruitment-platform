import { z } from "zod";
import { cityNameSchema } from "../common/location.schema.js";
import { companySlugSchema } from "../companies/company-profile.schema.js";

const emailSchema = z.string().trim().email("Invalid email address");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const userRegistrationSchema = z.object({
  role: z.literal("user"),
  firstName: z.string().trim().min(2, "First name is required").max(20),
  lastName: z.string().trim().min(2, "Last name is required").max(20),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().trim().min(7, "Phone number is required"),
  country: z.string().trim().min(2, "Country is required"),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Select a valid country"),
  state: z.string().trim().optional().or(z.literal("")),
  stateCode: z.string().trim().optional().or(z.literal("")),
  city: cityNameSchema,
  cityGeonameId: z
    .coerce.number()
    .int()
    .positive("Select a city from the list"),
  birthdate: z.string().trim().min(1, "Please select your birthdate"),
});

export const companyRegistrationSchema = z.object({
  role: z.literal("company"),
  companyName: z.string().trim().min(2, "Company name is required").max(64),
  slug: companySlugSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().trim().min(7, "Phone number is required"),
  country: z.string().trim().min(2, "Country is required"),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Select a valid country"),
  state: z.string().trim().optional().or(z.literal("")),
  stateCode: z.string().trim().optional().or(z.literal("")),
  city: cityNameSchema,
  cityGeonameId: z
    .coerce.number()
    .int()
    .positive("Select a city from the list"),
  description: z.string().trim().optional(),
  website: z
    .string()
    .trim()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),
  location: z.string().trim().min(1, "Location is required"),
});

export const registerSchema = z.discriminatedUnion("role", [
  userRegistrationSchema,
  companyRegistrationSchema,
]);

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type CompanyRegistrationInput = z.infer<
  typeof companyRegistrationSchema
>;
export type RegisterInput = z.infer<typeof registerSchema>;
