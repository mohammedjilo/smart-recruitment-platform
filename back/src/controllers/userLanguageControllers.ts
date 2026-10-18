import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import {
  addUserLanguage,
  deleteUserLanguage,
  getUserLanguages,
  updateUserLanguage,
} from "../services/userLanguage.service";
import { sendSuccess } from "../utils/apiResponse";

export const getUserLanguagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const languages = await getUserLanguages(userId);

    sendSuccess(res, 200, languages);
  }
);

export const addUserLanguageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { languageName, level } = req.body as {
      languageName?: string;
      level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "FLUENT" | "NATIVE";
    };

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    if (!languageName || !level) {
      throw new AppError("Language name and level are required", 400);
    }

    const language = await addUserLanguage(userId, { languageName, level });

    sendSuccess(res, 201, language, {
      message: "User language saved successfully",
    });
  }
);

export const updateUserLanguageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { userLanguageId } = req.params as { userLanguageId?: string };
    const { level } = req.body as {
      level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "FLUENT" | "NATIVE";
    };

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    if (!userLanguageId) {
      throw new AppError("User language id is required", 400);
    }

    if (!level) {
      throw new AppError("Level is required", 400);
    }

    const language = await updateUserLanguage(userId, userLanguageId, level);

    sendSuccess(res, 200, language, {
      message: "User language updated successfully",
    });
  }
);

export const deleteUserLanguageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { userLanguageId } = req.params as { userLanguageId?: string };

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    if (!userLanguageId) {
      throw new AppError("User language id is required", 400);
    }

    const result = await deleteUserLanguage(userId, userLanguageId);

    sendSuccess(res, 200, undefined, { message: result.message });
  }
);
