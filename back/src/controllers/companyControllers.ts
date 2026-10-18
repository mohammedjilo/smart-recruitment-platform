import { Request, Response } from "express";
import {
  getCompanyProfile,
  getCompanyUsers,
  getDashboardCompany,
  updateCompanyLogo,
  updateCompanyProfile,
} from "../services/company.service";
import {
  createJob,
  updateJob,
  getCompanyJobs,
  getCompanyJobById,
  deleteJob as deleteCompanyJob,
} from "../services/job.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import { cloudinaryUploadImage } from "../utils/cloudinary";
import { sendSuccess } from "../utils/apiResponse";
import { normalizeLocationFilter } from "../utils/locationData";
import { getCompanyUsersQuerySchema } from "../validation/company.validation";

/**
 * Company HTTP adapter. It translates requests and delegates company and Job
 * business rules to services; it must not contain database queries.
 */

export const getDashboardCompanyController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    const dashboardData = await getDashboardCompany(companyId);

    sendSuccess(res, 200, dashboardData);
  },
);

export const getCompanyUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    const query = getCompanyUsersQuerySchema.parse({
      ...req.query,
      page: req.query.page ?? req.query.pageNumber,
    });
    const location = await normalizeLocationFilter(query);
    const result = await getCompanyUsers({ ...query, ...location });

    sendSuccess(res, 200, result.users, {
      meta: result.pagination,
    });
  },
);

/**
 * @desc Create a new job for the authenticated company
 * @route /api/company/jobs
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
  },
);

/**
 * @desc Get all jobs of the authenticated company
 * @route /api/company/jobs
 * @method GET
 * @access private
 */
export const getCompanyJobsController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    const pageNumber = Number(req.query.pageNumber ?? 1);
    const search =
      typeof req.query.search === "string" && req.query.search.trim().length > 0
        ? req.query.search.trim()
        : undefined;
    const employmentType =
      typeof req.query.employmentType === "string"
        ? req.query.employmentType
        : undefined;
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const validEmploymentTypes = [
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "INTERNSHIP",
      "FREELANCE",
      "REMOTE",
    ];
    const validStatuses = ["OPEN", "CLOSED", "DRAFT", "EXPIRED"];

    if (employmentType && !validEmploymentTypes.includes(employmentType)) {
      throw new AppError("Invalid employment type", 400);
    }

    if (status && !validStatuses.includes(status)) {
      throw new AppError("Invalid job status", 400);
    }
    const sortBy =
      req.query.sortBy === "createdAt" ||
      req.query.sortBy === "title" ||
      req.query.sortBy === "status"
        ? req.query.sortBy
        : undefined;
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    const result = await getCompanyJobs(companyId, {
      pageNumber,
      search,
      employmentType,
      status,
      sortBy,
      sortOrder,
    });

    sendSuccess(res, 200, result.jobs, {
      meta: {
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
      },
      stats: result.stats,
    });
  },
);

/**
 * @desc Get one job by id for the authenticated company
 * @route /api/company/jobs/:id
 * @method GET
 * @access private
 */
export const getCompanyJobByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;
    const id = req.params.id as string;
    const slug = req.params.slug as string | undefined;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    const job = await getCompanyJobById(companyId, id, slug);

    sendSuccess(res, 200, job);
  },
);

/**
 * @desc Update a job of the authenticated company
 * @route /api/company/jobs/:id
 * @method PUT
 * @access private
 */
export const updateJobController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;
    const id = req.params.id as string;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    const job = await updateJob(companyId, id, req.body as any);

    sendSuccess(res, 200, job);
  },
);

/**
 * @desc Delete a job of the authenticated company
 * @route /api/company/jobs/:id
 * @method DELETE
 * @access private
 */
export const deleteJobController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;
    const id = req.params.id as string;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    const result = await deleteCompanyJob(companyId, id);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  },
);
/**
 * @desc Update company profile
 * @route /api/company/profile
 * @method PUT
 * @access private
 */
export const updateCompanyProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;
    const file = req.file;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    const profileInput = { ...req.body } as any;

    if (file?.buffer) {
      const uploadResult = await cloudinaryUploadImage(
        file.buffer,
        file.mimetype,
      );
      profileInput.logoId = uploadResult.public_id;
      profileInput.logoUrl = uploadResult.secure_url;
    }

    await updateCompanyProfile(companyId, profileInput);
    const updatedCompany = await updateCompanyProfile(companyId, profileInput);

    sendSuccess(res, 200, updatedCompany, {
      message: "Profile updated successfully",
    });
  },
);

/**
 * @desc Get the authenticated company profile
 * @route /api/company/profile
 * @method GET
 * @access private
 */
export const getCompanyProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    const company = await getCompanyProfile(companyId);

    sendSuccess(res, 200, company);
  },
);

/**
 * @desc Upload company logo
 * @route /api/company/logo
 * @method POST
 * @access private
 */
export const uploadCompanyLogoController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;
    const file = req.file;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    if (!file?.buffer) {
      throw new AppError("No image file provided", 400);
    }

    const uploadResult = await cloudinaryUploadImage(
      file.buffer,
      file.mimetype,
    );

    const company = await updateCompanyLogo(
      companyId,
      uploadResult.public_id,
      uploadResult.secure_url,
    );

    sendSuccess(
      res,
      200,
      {
        logoId: company.logoId,
        logoUrl: company.logoUrl,
      },
      {
        message: "Company logo uploaded successfully",
      },
    );
  },
);
