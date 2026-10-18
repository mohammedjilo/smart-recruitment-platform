import { z } from "zod";

export const skillValueSchema = z
  .string()
  .trim()
  .min(1, "Skill name is required")
  .max(50, "Skill name is too long");

export const skillSchema = z.object({ skillName: skillValueSchema });
export const userSkillsSchema = z.object({
  skills: z.array(skillValueSchema).min(1, "At least one skill is required"),
});
export const updateSkillSchema = skillSchema.partial();
export type SkillInput = z.infer<typeof skillSchema>;
export type UserSkillsInput = z.infer<typeof userSkillsSchema>;
