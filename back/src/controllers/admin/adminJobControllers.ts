import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import {
  getJobsByAdmin,
  getCompanyJobsByAdmin,
  getJobByAdmin,
  getQuestionsByAdmin,
  getJobApplicationsByAdmin,
  updateJobStatusByAdmin,
} from "../../services/admin/adminJob.service";
import {
  getCompanyJobsQuerySchema,
  getAdminJobsQuerySchema,
  getJobApplicationsQuerySchema,
} from "../../validation/admin.validation";

/**
 * @desc List and filter all jobs
 * @route /api/admin/jobs
 * @method GET
 * @access private
 */
export const getAllJobsController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getAdminJobsQuerySchema.parse(req.query);
    const result = await getJobsByAdmin(query);
    sendSuccess(res, 200, result.jobs, {
      meta: result.pagination,
      stats: result.stats,
    });
  }
);

/**
 * @desc List jobs belonging to a company
 * @route /api/admin/companies/:companyId/jobs
 * @method GET
 * @access private
 */
export const getCompanyJobsByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getCompanyJobsQuerySchema.parse(req.query);
    const result = await getCompanyJobsByAdmin(
      req.params.companyId as string,
      query
    );

    sendSuccess(res, 200, result.jobs, {
      meta: result.pagination,
      stats: result.stats,
    });
  }
);

/**
 * @desc Get a job by ID
 * @route /api/admin/jobs/:jobId
 * @method GET
 * @access private
 */
export const getJobByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const job = await getJobByAdmin(req.params.jobId as string);
    sendSuccess(res, 200, job);
  }
);

/**
 * @desc Get application questions for a job
 * @route /api/admin/jobs/:jobId/questions
 * @method GET
 * @access private
 */
export const getQuestionsByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const questions = await getQuestionsByAdmin(req.params.jobId as string);
    sendSuccess(res, 200, questions);
  }
);

/**
 * @desc List applications submitted to a job
 * @route /api/admin/jobs/:jobId/applications
 * @method GET
 * @access private
 */
export const getJobApplicationsByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getJobApplicationsQuerySchema.parse(req.query);
    const applications = await getJobApplicationsByAdmin(
      req.params.jobId as string,
      query
    );

    sendSuccess(res, 200, applications.data, {
      meta: applications.pagination,
      stats: applications.stats,
    });
  }
);

/**
 * @desc Update a job's status
 * @route /api/admin/jobs/:jobId/status
 * @method PATCH
 * @access private
 */
export const updateJobStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const job = await updateJobStatusByAdmin(
      req.params.jobId as string,
      req.body as any
    );
    sendSuccess(res, 200, job, { message: "Job status updated" });
  }
);
