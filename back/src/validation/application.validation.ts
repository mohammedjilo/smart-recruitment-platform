import { z } from "zod";
import { applicationSubmissionSchema as sharedApplicationSubmissionSchema } from "@smart-recruitment/validation";

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

export const applicationAnswerSchema = z.object({
  questionId: z.string().uuid("Invalid question id"),
  answer: answerValueSchema,
});

export const applicationSubmissionSchema = sharedApplicationSubmissionSchema;

export const applicationIdParamsSchema = z.object({
  applicationId: z.string().uuid("Invalid application id"),
});

export const jobIdParamsSchema = z.object({
  jobId: z.string().uuid("Invalid job id"),
});

export const applicationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  pageNumber: z.coerce.number().int().min(1).max(10000).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
  search: z.string().trim().max(200).optional(),
  status: z
    .enum([
      "PENDING",
      "REVIEWING",
      "SHORTLISTED",
      "INTERVIEW",
      "ACCEPTED",
      "REJECTED",
      "WITHDRAWN",
    ])
    .optional(),
  matchScore: z.enum(["HIGH", "GOOD", "FAIR", "LOW", "UNSCORED"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const companyApplicationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  pageNumber: z.coerce.number().int().min(1).max(10000).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
  status: z
    .enum([
      "PENDING",
      "REVIEWING",
      "SHORTLISTED",
      "INTERVIEW",
      "ACCEPTED",
      "REJECTED",
      "WITHDRAWN",
    ])
    .optional(),
  search: z.string().trim().max(120).optional(),
});

export const applicationStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "REVIEWING",
    "SHORTLISTED",
    "INTERVIEW",
    "ACCEPTED",
    "REJECTED",
  ]),
});

export type ApplicationStatusInput = z.infer<typeof applicationStatusSchema>;

export type ApplicationSubmissionInput = z.infer<
  typeof applicationSubmissionSchema
>;
