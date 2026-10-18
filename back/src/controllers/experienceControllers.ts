import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import {
  createExperience,
  updateExperience,
  deleteExperience,
} from "../services/experience.service.js";
import { sendSuccess } from "../utils/apiResponse";

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

export const deleteExperienceController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const experienceId = req.params.experienceId as string;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const result = await deleteExperience(userId, experienceId);

    sendSuccess(res, 200, undefined, { message: result.message });
  }
);
