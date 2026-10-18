import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(100),
  description: z.string().trim().max(500).optional().nullable(),
});

export const updateProjectSchema = projectSchema.partial();
export type ProjectInput = z.infer<typeof projectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
