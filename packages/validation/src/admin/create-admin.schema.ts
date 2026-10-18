import { z } from "zod";
import { roleValues } from "../common/enums.js";

export const createAdminSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  phone: z.string().trim().min(7).max(30),
  country: z.string().trim().min(2).max(80),
  roleName: z.enum(roleValues),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
