import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  assignAdminRole,
  createAdmin,
  getAdminAuthorization,
  getCurrentAdminPermissions,
  listAdminRoles,
  listAdmins,
  listAuditLogs,
  listPermissions,
  updateAdminStatus,
} from "../services/adminAuthorization.service.js";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/appError.js";

const getAdminId = (req: Request) => {
  if (!req.user)
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  return req.user.id;
};

export const getCurrentAdminPermissionsController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(res, 200, await getCurrentAdminPermissions(getAdminId(req)));
  }
);

export const createAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(res, 201, await createAdmin(getAdminId(req), req.body), {
      message: "Admin created successfully",
    });
  }
);

export const listAdminRolesController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(res, 200, await listAdminRoles(getAdminId(req)));
  }
);

export const listPermissionsController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(res, 200, await listPermissions(getAdminId(req)));
  }
);

export const listAdminsController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(res, 200, await listAdmins(getAdminId(req)));
  }
);

export const getAdminAuthorizationController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(
      res,
      200,
      await getAdminAuthorization(getAdminId(req), req.params.userId as string)
    );
  }
);

export const assignAdminRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(
      res,
      200,
      await assignAdminRole(
        getAdminId(req),
        req.params.userId as string,
        req.body.roleName
      )
    );
  }
);

export const updateAdminStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(
      res,
      200,
      await updateAdminStatus(
        getAdminId(req),
        req.params.userId as string,
        req.body.status
      )
    );
  }
);

export const listAuditLogsController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(res, 200, await listAuditLogs(getAdminId(req)));
  }
);
