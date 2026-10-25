import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import {
  getApplicationByAdmin,
  getProfileSnapshotByAdmin,
  getApplicationsByAdmin,
} from "../../services/admin/adminApplication.service";
import {
  getAdminApplicationsQuerySchema,
  getAdminCompanyApplicationsQuerySchema,
} from "../../validation/admin.validation";
import { getCompanyApplications } from "../../services/application.service";

/**
 * @desc Get applications submitted to a company's jobs
 * @route /api/admin/companies/:companyId/applications
 * @method GET
 * @access private
 */
export const getCompanyApplicationsByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.params.companyId as string;
    const query = getAdminCompanyApplicationsQuerySchema.parse(req.query);
    const result = await getCompanyApplications(companyId, {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      status: query.status === "ALL" ? undefined : query.status,
      matchScore: query.matchScore,
    });

    sendSuccess(res, 200, result.data, {
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        totalCount: result.totalCount,
      },
      stats: result.stats,
    });
  }
);

/**
 * @desc Get an application by ID
 * @route /api/admin/applications/:applicationId
 * @method GET
 * @access private
 */
export const getApplicationByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const application = await getApplicationByAdmin(
      req.params.applicationId as string
    );

    sendSuccess(res, 200, application);
  }
);

/**
 * @desc Get the profile snapshot attached to an application
 * @route /api/admin/applications/:applicationId/profile-snapshot
 * @method GET
 * @access private
 */
export const getProfileSnapshotByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const profileSnapshot = await getProfileSnapshotByAdmin(
      req.params.applicationId as string
    );

    sendSuccess(res, 200, profileSnapshot);
  }
);

/**
 * @desc List and filter all job applications
 * @route /api/admin/applications
 * @method GET
 * @access private
 */
export const getApplicationsByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getAdminApplicationsQuerySchema.parse(req.query);
    const applications = await getApplicationsByAdmin(query);

    sendSuccess(res, 200, applications.data, {
      meta: applications.pagination,
      stats: applications.stats,
    });
  }
);
