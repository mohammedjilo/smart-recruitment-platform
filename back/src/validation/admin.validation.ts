import { z } from "zod";
import { updateJobStatusSchema } from "@smart-recruitment/validation";
import {
  locationFilterFields,
  validateLocationFilter,
} from "../utils/locationData";

export { updateJobStatusSchema };

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
});

export const getAdminUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    search: z.string().trim().optional(),
    ...locationFilterFields,
    role: z.enum(["ALL", "USER"]).optional().default("USER"),
    status: z.enum(["ALL", "ACTIVE", "DEACTIVATED"]).optional().default("ALL"),
  })
  .superRefine(validateLocationFilter);

export const updateCompanyStatusSchema = z.object({
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
});

export const rejectCompanySchema = z.object({
  rejectionReason: z.string().trim().min(1).optional(),
});

export const getCompanyRequestsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  search: z.string().trim().optional(),
  approvalStatus: z
    .enum(["ALL", "PENDING", "APPROVED", "REJECTED"])
    .optional()
    .default("ALL"),
  status: z.enum(["ALL", "ACTIVE", "DEACTIVATED"]).optional().default("ALL"),
  requestedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "requestedDate must be YYYY-MM-DD")
    .optional(),
});

export const getAllCompaniesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    ...locationFilterFields,
    sortByNewest: z.preprocess(
      (value) => (value === "true" ? true : value === "false" ? false : value),
      z.boolean().optional().default(true),
    ),
    status: z.enum(["ALL", "ACTIVE", "DEACTIVATED"]).optional().default("ALL"),
    approvalStatus: z
      .enum(["ALL", "PENDING", "APPROVED", "REJECTED"])
      .optional()
      .default("ALL"),
  })
  .superRefine(validateLocationFilter);

export const getCompanyJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  search: z.string().trim().optional(),
  status: z
    .enum(["ALL", "OPEN", "CLOSED", "EXPIRED"])
    .optional()
    .default("ALL"),
  employmentType: z
    .enum([
      "ALL",
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "INTERNSHIP",
      "FREELANCE",
      "REMOTE",
    ])
    .optional()
    .default("ALL"),
});

export const getAdminJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  search: z.string().trim().optional(),
  status: z
    .enum(["ALL", "OPEN", "CLOSED", "EXPIRED"])
    .optional()
    .default("ALL"),
  employmentType: z
    .enum([
      "ALL",
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "INTERNSHIP",
      "FREELANCE",
      "REMOTE",
    ])
    .optional()
    .default("ALL"),
});

export const getJobApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  search: z.string().trim().optional(),
  status: z
    .enum([
      "ALL",
      "PENDING",
      "REVIEWING",
      "SHORTLISTED",
      "INTERVIEW",
      "ACCEPTED",
      "REJECTED",
      "WITHDRAWN",
    ])
    .optional()
    .default("ALL"),
  experience: z.enum(["ALL", "0-2", "3-5", "6+"]).optional().default("ALL"),
  matchScore: z
    .enum(["ALL", "HIGH", "GOOD", "FAIR", "LOW"])
    .optional()
    .default("ALL"),
});

export const getAdminApplicationsQuerySchema = getJobApplicationsQuerySchema;

export const getAdminCompanyApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
  search: z.string().trim().max(120).optional(),
  status: z
    .enum([
      "ALL",
      "PENDING",
      "REVIEWING",
      "SHORTLISTED",
      "INTERVIEW",
      "ACCEPTED",
      "REJECTED",
      "WITHDRAWN",
    ])
    .optional()
    .default("ALL"),
  matchScore: z
    .enum(["ALL", "HIGH", "GOOD", "FAIR", "LOW"])
    .optional()
    .default("ALL"),
});
