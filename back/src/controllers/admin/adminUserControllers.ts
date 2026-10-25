import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import {
  getUsersByAdmin,
  getUserByAdmin,
  updateUserStatusByAdmin,
} from "../../services/admin/adminUser.service";
import { getAdminUsersQuerySchema } from "../../validation/admin.validation";
import { normalizeLocationFilter } from "../../utils/locationData";

/**
 * @desc List and filter registered users
 * @route /api/admin/users
 * @method GET
 * @access private
 */
export const getAllUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getAdminUsersQuerySchema.parse(req.query);
    const location = await normalizeLocationFilter(query);
    const result = await getUsersByAdmin({ ...query, ...location });
    sendSuccess(res, 200, result.users, {
      meta: result.pagination,
      stats: result.stats,
    });
  }
);

/**
 * @desc Get user details by ID
 * @route /api/admin/users/:userId
 * @method GET
 * @access private
 */
export const getUserByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await getUserByAdmin(req.params.userId as string);
    sendSuccess(res, 200, user);
  }
);

/**
 * @desc Update a user's status
 * @route /api/admin/users/:userId/status
 * @method PATCH
 * @access private
 */
export const updateUserStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await updateUserStatusByAdmin(
      req.params.userId as string,
      req.body
    );
    sendSuccess(res, 200, user, { message: "User status updated" });
  }
);
