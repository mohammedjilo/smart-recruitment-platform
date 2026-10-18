import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import {
  getUsersByAdmin,
  getUserByAdmin,
  updateUserStatusByAdmin,
  deleteUserByAdmin,
} from "../../services/admin/adminUser.service";
import { getAdminUsersQuerySchema } from "../../validation/admin.validation";
import { normalizeLocationFilter } from "../../utils/locationData";

export const getAllUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getAdminUsersQuerySchema.parse(req.query);
    const location = await normalizeLocationFilter(query);
    const result = await getUsersByAdmin({ ...query, ...location });
    sendSuccess(res, 200, result.users, {
      meta: result.pagination,
      stats: result.stats,
    });
  },
);

export const getUserByAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await getUserByAdmin(req.params.userId as string);
    sendSuccess(res, 200, user);
  },
);

export const updateUserStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await updateUserStatusByAdmin(
      req.params.userId as string,
      req.body,
    );
    sendSuccess(res, 200, user, { message: "User status updated" });
  },
);

export const deleteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await deleteUserByAdmin(req.params.userId as string);
    sendSuccess(res, 200, undefined, { message: result.message });
  },
);
