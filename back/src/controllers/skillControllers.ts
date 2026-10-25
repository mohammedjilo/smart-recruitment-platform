import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import { addUserSkills, updateUserSkills } from "../services/skill.service.js";
import { sendSuccess } from "../utils/apiResponse";
/**
 * @desc Add user skills
 * @route /api/skill/me
 * @method POST
 * @access private
 */

export const addUserSkillsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const { skills } = req.body;

    const result = await addUserSkills(userId, skills);

    sendSuccess(res, 201, result, { message: "Skills added successfully" });
  }
);
/**
 * @desc Update user skills
 * @route /api/skill/me
 * @method PUT
 * @access private
 */
export const updateUserSkillsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const { skills } = req.body;

    const result = await updateUserSkills(userId, skills);

    sendSuccess(res, 200, result, { message: "Skills updated successfully" });
  }
);
