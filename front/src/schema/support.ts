import { z } from "zod"
import { createSupportTicketSchema } from "@smart-recruitment/validation"

export const createSupportRequestSchema = createSupportTicketSchema.extend({
   categoryId: z.string().trim().min(1, "Please select a category")
})

export type CreateSupportRequestFormValues = z.infer<typeof createSupportRequestSchema>
