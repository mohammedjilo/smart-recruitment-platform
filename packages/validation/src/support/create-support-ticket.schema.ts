import { z } from "zod";

export const createSupportTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Subject must contain at least 3 characters")
    .max(200),
  description: z
    .string()
    .trim()
    .min(10, "Description must contain at least 10 characters")
    .max(3000),
  categoryId: z.string().trim().min(1).optional(),
});

export type CreateSupportTicketInput = z.infer<
  typeof createSupportTicketSchema
>;
