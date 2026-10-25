import { Request, Response } from "express";
import { getAdminUserProfessionalProfile } from "../services/adminUserDetails.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

/**
 * @desc Get a user's professional profile
 * @route /api/admin/users/:userId/professional-profile
 * @method GET
 * @access private
 */
export const getAdminUserProfessionalProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await getAdminUserProfessionalProfile(
      req.params.userId as string
    );
    sendSuccess(res, 200, profile);
  }
);
