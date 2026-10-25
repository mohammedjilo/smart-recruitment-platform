import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import {
  getCompleteUserProfile,
  getCompaniesForUser,
  getCompanyDetailsForUser,
  getCompanyJobsForUser,
  updateProfessionalProfile,
  updateUserPersonalInformation,
  getDashboardData,
} from "../services/user.service";
import { getCompaniesQuerySchema } from "../validation/user.validation";
import { personalInformationUpdateSchema } from "@smart-recruitment/validation";
import { sendSuccess } from "../utils/apiResponse";
import { normalizeLocationFilter } from "../utils/locationData";

/**
 * User HTTP adapter for profile, company discovery, and dashboard flows.
 * Persistence and profile business rules remain in the corresponding services.
 */

/**
 * @desc Get the authenticated user's profile or a profile by user ID
 * @route /api/user/profile
 * @route /api/user/profile/:userId
 * @method GET
 * @access private
 */
export const getCompleteUserProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const requester = req.user
      ? { id: req.user.id, type: "user" as const }
      : req.company
        ? {
            id: req.company.id,
            type: "company" as const,
            approvalStatus: req.company.approvalStatus,
          }
        : null;
    const userId = (req.params.userId as string | undefined) ?? requester?.id;

    if (!requester) {
      throw new AppError("User authentication required", 401);
    }

    if (!userId) {
      throw new AppError("User id is required", 400);
    }

    const profile = await getCompleteUserProfile(userId, requester);

    sendSuccess(res, 200, profile);
  }
);

/**
 * @desc Browse companies with optional filters
 * @route /api/user/companies
 * @method GET
 * @access private
 */
export const getCompaniesController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getCompaniesQuerySchema.parse(req.query);
    const location = await normalizeLocationFilter(query);
    const result = await getCompaniesForUser({ ...query, ...location });

    sendSuccess(res, 200, result.companies, {
      meta: result.pagination,
    });
  }
);

/**
 * @desc Get public company details and job counts for an authenticated user
 * @route /api/user/companies/:companyId
 * @method GET
 * @access private
 */
export const getCompanyDetailsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const companyId = req.params.companyId as string;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const details = await getCompanyDetailsForUser(companyId);

    sendSuccess(res, 200, details);
  }
);

/**
 * @desc Get company jobs for an authenticated user
 * @route /api/user/companies/:companyId/jobs
 * @method GET
 * @access private
 */
export const getCompanyJobsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const companyId = req.params.companyId as string;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const pageNumber = Number(req.query.pageNumber ?? 1);
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    if (status && status !== "OPEN") {
      throw new AppError("Invalid job status", 400);
    }

    const result = await getCompanyJobsForUser(
      userId,
      companyId,
      pageNumber,
      search
    );

    sendSuccess(res, 200, result.jobs, {
      meta: result.pagination,
    });
  }
);

/**
 * @desc Update the authenticated user's personal information
 * @route /api/user/profile
 * @method PUT
 * @access private
 */
export const updateUserPersonalInformationController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const user = await updateUserPersonalInformation(
      userId,
      personalInformationUpdateSchema.parse(req.body)
    );
    sendSuccess(res, 200, user, {
      message: "Personal information updated successfully",
    });
  }
);

/**
 * @desc Update the existing professional profile of the authenticated user
 * @route /api/user/professional-profile
 * @method PUT
 * @access private
 */
export const updateProfessionalProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const profile = await updateProfessionalProfile(userId, req.body);

    sendSuccess(res, 200, profile, {
      message: "Professional profile updated successfully",
    });
  }
);

/**
 * @desc Get dashboard data for the authenticated user
 * @route /api/user/dashboard
 * @method GET
 * @access private
 */
export const getDashboardUserController = asyncHandler(
  async (req: Request, res: Response) => {
    // Extract userId from the token after authMiddleware processes it.
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    // Call the service.
    const dashboardData = await getDashboardData(userId, req.requestId);

    sendSuccess(res, 200, dashboardData);
  }
);
