import { z } from "zod";

export const adminRoleNameSchema = z.enum([
  "SUPER_ADMIN",
  "SUPPORT_ADMIN",
  "OPERATIONS_ADMIN",
]);

export const assignAdminRoleSchema = z.object({
  roleName: adminRoleNameSchema,
});

export const updateAdminStatusSchema = z.object({
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
});
