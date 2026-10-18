import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Message content is required").max(2000),
  applicationId: z.string().uuid("Invalid application id").optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
