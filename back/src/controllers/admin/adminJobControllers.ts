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
  deleteJobByAdmin,
} from "../../services/admin/adminJob.service";
import {
  getCompanyJobsQuerySchema,
  getAdminJobsQuerySchema,
  getJobApplicationsQuerySchema,
} from "../../validation/admin.validation";

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

export const getJobByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const job = await getJobByAdmin(req.params.jobId as string);
    sendSuccess(res, 200, job);
  }
);

export const getQuestionsByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const questions = await getQuestionsByAdmin(req.params.jobId as string);
    sendSuccess(res, 200, questions);
  }
);

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

export const updateJobStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const job = await updateJobStatusByAdmin(
      req.params.jobId as string,
      req.body as any
    );
    sendSuccess(res, 200, job, { message: "Job status updated" });
  }
);

export const deleteJobController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await deleteJobByAdmin(req.params.jobId as string);
    sendSuccess(res, 200, undefined, { message: result.message });
  }
);
