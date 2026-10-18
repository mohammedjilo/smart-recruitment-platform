import { Request, Response } from "express";
import { getAdminUserProfessionalProfile } from "../services/adminUserDetails.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getAdminUserProfessionalProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await getAdminUserProfessionalProfile(
      req.params.userId as string
    );
    sendSuccess(res, 200, profile);
  }
);
