import { z } from "zod";

export const aiMatchSchema = z.object({
  score: z.number().min(0).max(100),
  recommendation: z.string().trim().min(1).max(500),
  strengths: z.array(z.string().trim().min(1).max(200)).max(10),
  missingSkills: z.array(z.string().trim().min(1).max(100)).max(20),
});

export const aiRecommendationSchema = aiMatchSchema.extend({
  jobId: z.string().uuid(),
});

export const aiRecommendationBatchSchema = z.object({
  recommendations: z.array(aiRecommendationSchema).max(20),
});

export type AiRecommendation = z.infer<typeof aiRecommendationSchema>;
