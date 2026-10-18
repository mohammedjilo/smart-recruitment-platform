import { z } from "zod";

const answerValueSchema = z.union([
  z.string().trim().max(5000),
  z.array(z.string().trim().min(1).max(500)).min(1).max(20),
]);

const parseAnswers = (value: unknown) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

export const createApplicationSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(7).max(30),
    country: z.string().trim().min(2).max(80),
    age: z
      .string()
      .trim()
      .regex(/^\d{1,3}$/, "Age must be numeric")
      .refine(
        (value) => Number(value) >= 13 && Number(value) <= 100,
        "Age must be between 13 and 100"
      ),
    jobTitle: z.string().trim().min(2).max(160),
    useProfessionalProfile: z.preprocess(
      (value) => (value === "true" ? true : value === "false" ? false : value),
      z.boolean()
    ),
    answers: z.preprocess(
      parseAnswers,
      z
        .array(
          z.object({
            questionId: z.string().uuid("Invalid question id"),
            answer: answerValueSchema,
          })
        )
        .max(100)
    ),
  })
  .superRefine((data, context) => {
    const questionIds = data.answers.map((answer) => answer.questionId);
    if (new Set(questionIds).size !== questionIds.length) {
      context.addIssue({
        code: "custom",
        path: ["answers"],
        message: "Each question may only be answered once",
      });
    }
  });

export const applicationSubmissionSchema = createApplicationSchema;

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
