import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import {
  createExperience,
  updateExperience,
} from "../services/experience.service.js";
import { sendSuccess } from "../utils/apiResponse";

/**
 * @desc Add work experience to the authenticated user's profile
 * @route /api/experience
 * @method POST
 * @access private
 */
export const createExperienceController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const experience = await createExperience(userId, req.body as any);

    sendSuccess(res, 201, experience, {
      message: "Experience created successfully",
    });
  }
);

/**
 * @desc Update work experience in the authenticated user's profile
 * @route /api/experience/:experienceId
 * @method PUT
 * @access private
 */
export const updateExperienceController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const experienceId = req.params.experienceId as string;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const experience = await updateExperience(
      userId,
      experienceId,
      req.body as any
    );

    sendSuccess(res, 200, experience, {
      message: "Experience updated successfully",
    });
  }
);
