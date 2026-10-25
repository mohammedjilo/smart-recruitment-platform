import { Request, Response } from "express";
import { EmploymentType } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import {
  changeJobStatus,
  getJobs,
  createJob,
  getJobById,
  getQuestions,
  getBasicInformations,
} from "../services/job.service";
import type { JobStatus } from "../services/job.service";
import { AppError } from "../utils/appError.js";
import { sendSuccess } from "../utils/apiResponse";

const isEmploymentType = (value: string): value is EmploymentType =>
  Object.values(EmploymentType).some(
    (employmentType) => employmentType === value
  );

/**
 * Job HTTP adapter for user reads and company mutations. Job lifecycle,
 * approval, ownership, and deadline rules belong to `job.service.ts`.
 */

/**
 * @desc Update a company's job status and deadline
 * @route /api/jobs/:id/status
 * @method PATCH
 * @access private
 */
export const updateJobStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;
    const jobId = req.params.id as string;
    const { status, deadline } = req.body as {
      status: JobStatus;
      deadline?: string;
    };

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    if (!jobId) {
      throw new AppError("Job id is required", 400);
    }

    const job = await changeJobStatus(companyId, jobId, status, deadline);

    sendSuccess(res, 200, job, { message: "Job status updated successfully" });
  }
);

/**
 * @desc Create a new job for the authenticated company
 * @route /api/jobs
 * @method POST
 * @access private
 */
export const createJobController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    const job = await createJob(companyId, req.body as any);

    sendSuccess(res, 201, job);
  }
);
/**
 * @desc Get all jobs for the authenticated user with optional search and pagination
 * @route /api/jobs
 * @method GET
 * @access private
 */
export const getJobsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User authentication required", 401);

    const pageNumber = Number(req.query.pageNumber ?? 1);
    const search =
      typeof req.query.search === "string" && req.query.search.trim().length > 0
        ? req.query.search.trim()
        : undefined;
    const employmentTypeParam = req.query.employmentType;
    const employmentType =
      typeof employmentTypeParam === "string" &&
      isEmploymentType(employmentTypeParam)
        ? employmentTypeParam
        : undefined;

    if (employmentTypeParam !== undefined && employmentType === undefined) {
      throw new AppError("Invalid employment type", 400);
    }

    const { jobsWithSaveStatus, totalCount, page, pageSize } = await getJobs(
      userId,
      pageNumber,
      search,
      employmentType
    );

    sendSuccess(res, 200, jobsWithSaveStatus, {
      meta: {
        totalCount,
        page,
        pageSize,
      },
    });
  }
);
/**
 * @desc Get a job by its ID for the authenticated user
 * @route /api/jobs/:id/:slug
 * @method GET
 * @access private
 */
export const getJobByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User authentication required", 401);
    const { id, slug } = req.params;
    const job = await getJobById(userId, id as string, slug as string);

    sendSuccess(res, 200, job);
  }
);
/**
 * @desc Get questions for a specific job
 * @route /api/jobs/:id/questions
 * @method GET
 * @access private
 */
export const getQuestionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User authentication required", 401);
    const { id } = req.params;

    const Questions = await getQuestions(userId, id as string);

    sendSuccess(res, 200, Questions);
  }
);
/**
 * @desc Get basic information for the authenticated user
 * @route /api/jobs/info
 * @method GET
 * @access private
 */
export const getBasicInformationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User authentication required", 401);

    const info = await getBasicInformations(userId);

    sendSuccess(res, 200, info);
  }
);
