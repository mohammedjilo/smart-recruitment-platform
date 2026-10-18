import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import { getProfessionalProfile } from "../services/professionalProfile.service";
import { sendSuccess } from "../utils/apiResponse";

/**
 * @desc Get the professional profile for the authenticated user
 * @route /api/professional-profile
 * @method GET
 * @access private
 */
export const getProfessionalProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const profile = await getProfessionalProfile(userId);

    sendSuccess(res, 200, profile);
  }
);

// export const professionalProfileIsCompletedController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const userId = (req as any).user?.id;

//     if (!userId) {
//       throw new AppError("User authentication required", 401);
//     }

//     const profile = await getProfessionalProfile(
//       userId,
//     );

//     res.status(200).json({
//       status: "success",
//       message: "Profile photo updated successfully",
//       data:profile
//     });
//   }
// );
