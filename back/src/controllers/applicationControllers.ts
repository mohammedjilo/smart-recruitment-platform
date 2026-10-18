import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import type {
  ApplicationStatusInput,
  ApplicationSubmissionInput,
} from "../validation/application.validation";
import {
  applicationIdParamsSchema,
  applicationListQuerySchema,
} from "../validation/application.validation";
import {
  applyToJob,
  deleteApplication,
  getCompanyApplications,
  getJobApplications,
  getUserApplicationDetails,
  getUserApplications,
  updateApplicationStatus,
  withdrawApplication,
} from "../services/application.service";
import { sendSuccess } from "../utils/apiResponse";

/**
 * Application HTTP adapter. It handles authentication and input validation,
 * then delegates ownership, status, deadline, and answer rules to services.
 * It must not query Prisma directly or implement domain policy.
 */

export const applyToJobController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const jobId = Array.isArray(req.params.jobId)
      ? req.params.jobId[0]
      : req.params.jobId;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    if (!jobId) {
      throw new AppError("Job id is required", 400);
    }

    const input = req.body as ApplicationSubmissionInput;
    const application = await applyToJob(
      userId,
      jobId,
      input,
      req.file,
      req.requestId
    );

    sendSuccess(res, 201, application, {
      message: "Application submitted successfully",
    });
  }
);
export const getUserApplicationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const { page, pageSize, search, status, matchScore, sortOrder } =
      applicationListQuerySchema.parse(req.query);

    const result = await getUserApplications(userId, {
      page,
      pageSize,
      search,
      status,
      matchScore,
      sortOrder,
    });
    const meta = {
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
    };

    sendSuccess(res, 200, result.data, { meta });
  }
);

export const getUserApplicationDetailsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const { applicationId } = applicationIdParamsSchema.parse(req.params);
    const application = await getUserApplicationDetails(userId, applicationId);

    sendSuccess(res, 200, application);
  }
);

export const getJobApplicationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;
    const { jobId } = req.params as { jobId?: string };

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    if (!jobId) {
      throw new AppError("Job id is required", 400);
    }

    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 6);
    const applications = await getJobApplications(
      companyId,
      jobId,
      page,
      pageSize
    );
    const meta = {
      page: applications.page,
      pageSize: applications.pageSize,
      totalCount: applications.totalCount,
    };

    sendSuccess(res, 200, applications.data, { meta });
  }
);

export const getCompanyApplicationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    const pageNumber = Number(req.query.pageNumber ?? req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 6);
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const sortBy =
      typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt";
    const sortOrder =
      typeof req.query.sortOrder === "string" ? req.query.sortOrder : "desc";

    const result = await getCompanyApplications(companyId, {
      page: pageNumber,
      status: status as
        | "PENDING"
        | "REVIEWING"
        | "SHORTLISTED"
        | "INTERVIEW"
        | "ACCEPTED"
        | "REJECTED"
        | "WITHDRAWN"
        | undefined,
      search,
      pageSize,
      sortBy: sortBy === "updatedAt" ? "updatedAt" : "createdAt",
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
    });

    const meta = {
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
    };

    sendSuccess(res, 200, result.data, { meta, stats: result.stats });
  }
);

export const updateApplicationStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;
    const { applicationId } = req.params as { applicationId?: string };
    const { status } = req.body as ApplicationStatusInput;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    if (!applicationId) {
      throw new AppError("Application id is required", 400);
    }

    const application = await updateApplicationStatus(
      companyId,
      applicationId,
      status
    );

    sendSuccess(res, 200, application, {
      message: "Application status updated successfully",
    });
  }
);

export const deleteApplicationController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { applicationId } = req.params as { applicationId?: string };

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    if (!applicationId) {
      throw new AppError("Application id is required", 400);
    }

    const result = await deleteApplication(userId, applicationId);

    sendSuccess(res, 200, undefined, { message: result.message });
  }
);

export const withdrawApplicationController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { applicationId } = req.params as { applicationId?: string };

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    if (!applicationId) {
      throw new AppError("Application id is required", 400);
    }

    const application = await withdrawApplication(userId, applicationId);

    sendSuccess(res, 200, application, {
      message: "Application withdrawn successfully",
    });
  }
);
