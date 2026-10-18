import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import { cloudinaryUploadImage } from "../utils/cloudinary";
import {
  updateUserPhoto,
  getCompleteUserProfile,
  getCompaniesForUser,
  getCompanyDetailsForUser,
  getCompanyJobsForUser,
  upsertProfessionalProfile,
  getDashboardData,
} from "../services/user.service";
import { getCompaniesQuerySchema } from "../validation/user.validation";
import { sendSuccess } from "../utils/apiResponse";
import { normalizeLocationFilter } from "../utils/locationData";

/**
 * User HTTP adapter for profile, company discovery, and dashboard flows.
 * Persistence and profile business rules remain in the corresponding services.
 */

/**
 * @desc Update the profile photo of the authenticated user
 * @route /api/user/photo
 * @method POST
 * @access private
 */
export const updateUserPhotoController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    if (!file?.buffer) {
      throw new AppError("No image file provided", 400);
    }

    const uploadResult = await cloudinaryUploadImage(
      file.buffer,
      file.mimetype,
    );

    const user = await updateUserPhoto(
      userId,
      uploadResult.public_id,
      uploadResult.secure_url,
    );

    sendSuccess(
      res,
      200,
      {
        profilePicId: user.profilePicId,
        profilePicUrl: user.profilePicUrl,
      },
      {
        message: "Profile photo updated successfully",
      },
    );
  },
);

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
  },
);

export const getCompaniesController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getCompaniesQuerySchema.parse(req.query);
    const location = await normalizeLocationFilter(query);
    const result = await getCompaniesForUser({ ...query, ...location });

    sendSuccess(res, 200, result.companies, {
      meta: result.pagination,
    });
  },
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
  },
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
    const validStatuses = ["OPEN", "CLOSED", "EXPIRED"] as const;

    if (
      status &&
      !validStatuses.includes(status as (typeof validStatuses)[number])
    ) {
      throw new AppError("Invalid job status", 400);
    }

    const result = await getCompanyJobsForUser(
      userId,
      companyId,
      pageNumber,
      search,
      status as (typeof validStatuses)[number] | undefined,
    );

    sendSuccess(res, 200, result.jobs, {
      meta: result.pagination,
    });
  },
);

/**
 * @desc Upsert the professional profile of the authenticated user
 * @route /api/user/professional-profile
 * @method POST
 * @access private
 */
export const upsertProfessionalProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const profile = await upsertProfessionalProfile(userId, req.body as any);

    sendSuccess(res, 200, profile, {
      message: "Professional profile saved successfully",
    });
  },
);

/**
 * @desc    get dashboard data for the authenticated user
 * @route   GET /api/user/dashboard
 * @method  GET
 * @access  Private (requires authentication)
 */
export const getDashboardUserController = asyncHandler(
  async (req: Request, res: Response) => {
    // استخراج userId من التوكن (بعد تمريره عبر authMiddleware)
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    // استدعاء الخدمة
    const dashboardData = await getDashboardData(userId, req.requestId);

    sendSuccess(res, 200, dashboardData);
  },
);
