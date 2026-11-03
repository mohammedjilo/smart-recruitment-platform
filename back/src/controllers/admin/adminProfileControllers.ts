import type { Request, Response } from "express";
import { updateAdminProfileSchema } from "@smart-recruitment/validation";
import { AppError } from "../../utils/appError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import {
  getAdminProfile,
  updateAdminProfile,
  updateAdminProfilePicture,
} from "../../services/admin/adminProfile.service.js";

const getActorId = (req: Request) => {
  if (!req.user || req.user.role !== "ADMIN") {
    throw new AppError("Admin access required", 403, "FORBIDDEN");
  }
  return req.user.id;
};

export const getAdminProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await getAdminProfile(getActorId(req));
    sendSuccess(res, 200, profile);
  }
);

export const updateAdminProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await updateAdminProfile(
      getActorId(req),
      updateAdminProfileSchema.parse(req.body)
    );
    sendSuccess(res, 200, profile, {
      message: "Admin profile updated successfully",
    });
  }
);

export const updateAdminProfilePictureController = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      throw new AppError("Profile picture is required", 400, "BAD_REQUEST");
    }

    const profile = await updateAdminProfilePicture(getActorId(req), file);
    sendSuccess(res, 200, profile, {
      message: "Admin profile picture updated successfully",
    });
  }
);
