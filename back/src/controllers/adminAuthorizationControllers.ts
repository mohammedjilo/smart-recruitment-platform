import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  assignAdminRole,
  createAdmin,
  getAdminAuthorization,
  getCurrentAdminPermissions,
  listAdminRoles,
  listAdmins,
  updateAdminStatus,
} from "../services/adminAuthorization.service.js";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/appError.js";

const getAdminId = (req: Request) => {
  if (!req.user)
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  return req.user.id;
};

/**
 * @desc Get the current administrator's permissions
 * @route /api/admin/me/permissions
 * @method GET
 * @access private
 */
export const getCurrentAdminPermissionsController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(res, 200, await getCurrentAdminPermissions(getAdminId(req)));
  }
);

/**
 * @desc Create an administrator account
 * @route /api/admin/admins
 * @method POST
 * @access private
 */
export const createAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(res, 201, await createAdmin(getAdminId(req), req.body), {
      message: "Admin created successfully",
    });
  }
);

/**
 * @desc List available administrator roles
 * @route /api/admin/roles
 * @method GET
 * @access private
 */
export const listAdminRolesController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(res, 200, await listAdminRoles(getAdminId(req)));
  }
);

/**
 * @desc List administrator accounts
 * @route /api/admin/admins
 * @method GET
 * @access private
 */
export const listAdminsController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(res, 200, await listAdmins(getAdminId(req)));
  }
);

/**
 * @desc Get an administrator's role and permissions
 * @route /api/admin/admins/:userId/permissions
 * @method GET
 * @access private
 */
export const getAdminAuthorizationController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(
      res,
      200,
      await getAdminAuthorization(getAdminId(req), req.params.userId as string)
    );
  }
);

/**
 * @desc Assign a role to an administrator
 * @route /api/admin/admins/:userId/role
 * @method PATCH
 * @access private
 */
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

/**
 * @desc Update an administrator account's status
 * @route /api/admin/admins/:userId/status
 * @method PATCH
 * @access private
 */
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
