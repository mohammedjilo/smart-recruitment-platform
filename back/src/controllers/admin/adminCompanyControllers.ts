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
  deleteCompanyByAdmin,
} from "../../services/admin/adminCompany.service";
import {
  getCompanyRequestsQuerySchema,
  getAllCompaniesQuerySchema,
  rejectCompanySchema,
} from "../../validation/admin.validation";
import { normalizeLocationFilter } from "../../utils/locationData";

export const approveCompanyController = asyncHandler(
  async (req: Request, res: Response) => {
    const company = await approveCompanyByAdmin(req.params.companyId as string);

    sendSuccess(res, 200, company, {
      message: "Company approved successfully",
    });
  },
);

export const rejectCompanyController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = rejectCompanySchema.parse(req.body ?? {});
    const company = await rejectCompanyByAdmin(
      req.params.companyId as string,
      input,
    );

    sendSuccess(res, 200, company, {
      message: "Company rejected successfully",
    });
  },
);

export const getCompanyRequestsController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getCompanyRequestsQuerySchema.parse(req.query);
    const result = await getCompanyRequests(query);

    sendSuccess(res, 200, result.companies, {
      meta: result.pagination,
      stats: result.stats,
    });
  },
);

export const getAllCompaniesController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getAllCompaniesQuerySchema.parse(req.query);
    const location = await normalizeLocationFilter(query);
    const result = await getAllCompaniesAdmin({ ...query, ...location });
    sendSuccess(res, 200, result.companies, {
      meta: result.pagination,
      stats: result.stats,
    });
  },
);

export const getCompanyByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const company = await getCompanyByAdmin(req.params.companyId as string);
    sendSuccess(res, 200, company);
  },
);

export const updateCompanyStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const company = await updateCompanyStatusByAdmin(
      req.params.companyId as string,
      req.body as any,
    );
    sendSuccess(res, 200, company, { message: "Company status updated" });
  },
);

export const deleteCompanyController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await deleteCompanyByAdmin(req.params.companyId as string);
    sendSuccess(res, 200, undefined, { message: result.message });
  },
);
