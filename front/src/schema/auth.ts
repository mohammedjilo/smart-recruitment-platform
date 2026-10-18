import { z } from "zod"
import {
   companyRegistrationSchema as sharedCompanyRegistrationSchema,
   loginSchema as sharedLoginSchema,
   userRegistrationSchema as sharedUserRegistrationSchema
} from "@smart-recruitment/validation"

// Login.tsx
export const loginSchema = sharedLoginSchema.extend({
   role: z.enum(["user", "company"], {
      message: "Role is required and must be 'user' or 'company'"
   })
})

export type LoginFormValues = z.infer<typeof loginSchema>

// RegisterUser.tsx
export const registerUserSchema = sharedUserRegistrationSchema
   .omit({ role: true })
   .extend({
      cityGeonameId: z.number().int().positive("Select a city from the list"),
      confirmPassword: z.string().min(1, "Confirm your password"),
      birthdate: z.string().min(1, "Please select your birthdate")
   })
   .refine(
      (data: { password: string; confirmPassword: string }) =>
         data.password === data.confirmPassword,
      {
         message: "Passwords do not match",
         path: ["confirmPassword"]
      }
   )

export type RegisterUserFormValues = z.infer<typeof registerUserSchema>
// RegisterCompany.tsx
export const registerCompanySchema = sharedCompanyRegistrationSchema
   .omit({ role: true })
   .extend({
      cityGeonameId: z.number().int().positive("Select a city from the list"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
      logo: z
         .instanceof(File, { message: "Logo must be a valid image file" })
         .nullable()
         .optional()
   })
   .refine(
      (data: { password: string; confirmPassword: string }) =>
         data.password === data.confirmPassword,
      {
         message: "Passwords do not match",
         path: ["confirmPassword"]
      }
   )

export type RegisterCompanyFormValues = z.infer<typeof registerCompanySchema>
