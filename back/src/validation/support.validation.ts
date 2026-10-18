import { z } from "zod";
import { createSupportTicketSchema as sharedCreateSupportTicketSchema } from "@smart-recruitment/validation";

export const createSupportTicketSchema = sharedCreateSupportTicketSchema;

export const supportTicketStatusValues = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_USER",
  "RESOLVED",
  "CLOSED",
] as const;

export const supportPriorityValues = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;

export const addSupportMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message content is required")
    .max(2000, "Message must be at most 2000 characters"),
  requiresUserResponse: z.boolean().optional().default(false),
});

export const updateSupportTicketStatusSchema = z.object({
  status: z.enum(supportTicketStatusValues),
});

export const updateSupportTicketPrioritySchema = z.object({
  priority: z.enum(supportPriorityValues),
});

export const assignSupportTicketSchema = z.object({
  assignedAdminId: z.string().trim().min(1, "Assigned admin id is required"),
});

export const supportCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
  audience: z.enum(["USER", "COMPANY"]).optional(),
});

export const supportAdminTicketsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
  search: z.string().trim().max(200).optional(),
  status: z.enum(supportTicketStatusValues).optional(),
  priority: z.enum(supportPriorityValues).optional(),
  audience: z.enum(["USER", "COMPANY"]).optional(),
  categoryId: z.string().trim().min(1).optional(),
  assignedAdminId: z
    .union([z.literal("UNASSIGNED"), z.string().trim().min(1)])
    .optional(),
});

export const createSupportCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must contain at least 2 characters")
    .max(100, "Category name must be at most 100 characters"),
  audience: z.enum(["USER", "COMPANY"]).optional().default("USER"),
  active: z.boolean().optional().default(true),
});

export const updateSupportCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must contain at least 2 characters")
    .max(100, "Category name must be at most 100 characters")
    .optional(),
  audience: z.enum(["USER", "COMPANY"]).optional(),
  active: z.boolean().optional(),
});
