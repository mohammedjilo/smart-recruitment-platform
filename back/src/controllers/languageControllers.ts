import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import {
  createLanguage,
  deleteLanguage,
  getAllLanguages,
  updateLanguage,
} from "../services/language.service";
import { sendSuccess } from "../utils/apiResponse";

export const getLanguagesController = asyncHandler(
  async (_req: Request, res: Response) => {
    const languages = await getAllLanguages();

    sendSuccess(res, 200, languages);
  }
);

export const createLanguageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { languageName } = req.body as { languageName?: string };

    if (!languageName) {
      throw new AppError("Language name is required", 400);
    }

    const language = await createLanguage(languageName);

    sendSuccess(res, 201, language, {
      message: "Language created successfully",
    });
  }
);

export const updateLanguageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { languageId } = req.params as { languageId?: string };
    const { languageName } = req.body as { languageName?: string };

    if (!languageId) {
      throw new AppError("Language id is required", 400);
    }

    if (!languageName) {
      throw new AppError("Language name is required", 400);
    }

    const language = await updateLanguage(languageId, languageName);

    sendSuccess(res, 200, language, {
      message: "Language updated successfully",
    });
  }
);

export const deleteLanguageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { languageId } = req.params as { languageId?: string };

    if (!languageId) {
      throw new AppError("Language id is required", 400);
    }

    const result = await deleteLanguage(languageId);

    sendSuccess(res, 200, undefined, { message: result.message });
  }
);
