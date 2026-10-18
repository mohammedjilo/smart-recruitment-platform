import { z } from "zod";
import {
  employmentTypeValues,
  jobStatusValues,
  questionTypeValues,
} from "../common/enums.js";
import { isValidDateOnly } from "./date-only.js";

export const jobDeadlineSchema = z
  .string()
  .refine(
    isValidDateOnly,
    "Deadline must be a valid date in YYYY-MM-DD format"
  );

export const applicationQuestionSchema = z
  .object({
    id: z.string().optional(),
    question: z
      .string()
      .trim()
      .min(3, "Question must be at least 3 characters"),
    type: z.enum(questionTypeValues),
    required: z.boolean().optional().default(true),
    order: z.number().int().min(0).optional().default(0),
    options: z.array(z.string().trim().min(1)).optional().default([]),
    minSelection: z.number().int().min(0).optional(),
    maxSelection: z.number().int().min(0).optional(),
    minNumber: z.number().finite().optional(),
    maxNumber: z.number().finite().optional(),
  })
  .refine(
    (value: {
      type: (typeof questionTypeValues)[number];
      options: string[];
      minSelection?: number;
      maxSelection?: number;
      minNumber?: number;
      maxNumber?: number;
    }) =>
      !["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(value.type) ||
      value.options.length >= 2,
    {
      message: "Select at least two options for choice questions",
      path: ["options"],
    }
  )
  .refine(
    (value: { minSelection?: number; maxSelection?: number }) =>
      value.minSelection === undefined ||
      value.maxSelection === undefined ||
      value.minSelection <= value.maxSelection,
    {
      message: "Minimum selections cannot exceed maximum selections",
      path: ["minSelection"],
    }
  )
  .refine(
    (value: { minNumber?: number; maxNumber?: number }) =>
      value.minNumber === undefined ||
      value.maxNumber === undefined ||
      value.minNumber <= value.maxNumber,
    {
      message: "Minimum number cannot exceed maximum number",
      path: ["minNumber"],
    }
  );

export const createJobSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),
  employmentType: z.enum(employmentTypeValues),
  salary: z.number().positive("Salary must be positive").optional().nullable(),
  deadline: jobDeadlineSchema,
  experienceRequired: z
    .number()
    .int()
    .min(0, "Experience must be non-negative"),
  skills: z.array(z.string().trim().min(1)).optional(),
  questions: z.array(applicationQuestionSchema).optional().default([]),
});

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(jobStatusValues).optional(),
  questions: z.array(applicationQuestionSchema).optional(),
});

export const updateJobStatusSchema = z.object({
  status: z.enum(jobStatusValues),
  deadline: jobDeadlineSchema.optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
