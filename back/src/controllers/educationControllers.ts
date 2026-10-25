import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import {
  createEducation,
  updateEducation,
} from "../services/education.service.js";
import { sendSuccess } from "../utils/apiResponse";
/**
 * @desc Create a new education entry for the authenticated user
 * @route /api/education
 * @method POST
 * @access private
 */
export const createEducationController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const education = await createEducation(userId, req.body as any);

    sendSuccess(res, 201, education, {
      message: "Education created successfully",
    });
  }
);
/**
 * @desc Update an existing education entry for the authenticated user
 * @route /api/education/:educationId
 * @method PUT
 * @access private
 */
export const updateEducationController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const educationId = req.params.educationId as string;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const education = await updateEducation(
      userId,
      educationId,
      req.body as any
    );

    sendSuccess(res, 200, education, {
      message: "Education updated successfully",
    });
  }
);
