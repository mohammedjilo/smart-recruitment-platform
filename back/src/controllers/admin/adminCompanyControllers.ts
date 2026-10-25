import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import {
  approveCompanyByAdmin,
  rejectCompanyByAdmin,
  getAllCompaniesAdmin,
  getCompanyRequests,
  getCompanyByAdmin,
  updateCompanyStatusByAdmin,
} from "../../services/admin/adminCompany.service";
import {
  getCompanyRequestsQuerySchema,
  getAllCompaniesQuerySchema,
  rejectCompanySchema,
} from "../../validation/admin.validation";
import { normalizeLocationFilter } from "../../utils/locationData";

/**
 * @desc Approve a company registration
 * @route /api/admin/companies/:companyId/approve
 * @method PATCH
 * @access private
 */
export const approveCompanyController = asyncHandler(
  async (req: Request, res: Response) => {
    const company = await approveCompanyByAdmin(req.params.companyId as string);

    sendSuccess(res, 200, company, {
      message: "Company approved successfully",
    });
  }
);

/**
 * @desc Reject a company registration
 * @route /api/admin/companies/:companyId/reject
 * @method PATCH
 * @access private
 */
export const rejectCompanyController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = rejectCompanySchema.parse(req.body ?? {});
    const company = await rejectCompanyByAdmin(
      req.params.companyId as string,
      input
    );

    sendSuccess(res, 200, company, {
      message: "Company rejected successfully",
    });
  }
);

/**
 * @desc List company registrations awaiting review
 * @route /api/admin/company-requests
 * @method GET
 * @access private
 */
export const getCompanyRequestsController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getCompanyRequestsQuerySchema.parse(req.query);
    const result = await getCompanyRequests(query);

    sendSuccess(res, 200, result.companies, {
      meta: result.pagination,
      stats: result.stats,
    });
  }
);

/**
 * @desc List and filter companies
 * @route /api/admin/companies
 * @method GET
 * @access private
 */
export const getAllCompaniesController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getAllCompaniesQuerySchema.parse(req.query);
    const location = await normalizeLocationFilter(query);
    const result = await getAllCompaniesAdmin({ ...query, ...location });
    sendSuccess(res, 200, result.companies, {
      meta: result.pagination,
      stats: result.stats,
    });
  }
);

/**
 * @desc Get company details by ID
 * @route /api/admin/companies/:companyId
 * @method GET
 * @access private
 */
export const getCompanyByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const company = await getCompanyByAdmin(req.params.companyId as string);
    sendSuccess(res, 200, company);
  }
);

/**
 * @desc Update a company's status
 * @route /api/admin/companies/:companyId/status
 * @method PATCH
 * @access private
 */
export const updateCompanyStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const company = await updateCompanyStatusByAdmin(
      req.params.companyId as string,
      req.body as any
    );
    sendSuccess(res, 200, company, { message: "Company status updated" });
  }
);
