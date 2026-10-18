import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import {
  createSkill,
  updateSkill,
  deleteSkill,
  addUserSkills,
  updateUserSkills,
  removeUserSkill,
} from "../services/skill.service.js";
import { sendSuccess } from "../utils/apiResponse";
/**
 * @desc Add user skills
 * @route /api/users/me/skills
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
 * @route /api/users/me/skills
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
/**
 * @desc Remove a skill from the authenticated user
 * @route /api/users/me/skills/:skillId
 * @method DELETE
 * @access private
 */
export const removeUserSkillController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const skillId = req.params.skillId as string;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const result = await removeUserSkill(userId, skillId);

    sendSuccess(res, 200, undefined, { message: result.message });
  }
);
/**
 * @desc Create a new skill
 * @route /api/skills
 * @method POST
 * @access private
 */
export const createSkillController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const skill = await createSkill(req.body as any);

    sendSuccess(res, 201, skill, { message: "Skill created successfully" });
  }
);

/**
 * @desc Update an existing skill
 * @route /api/skills/:skillId
 * @method PUT
 * @access private
 */
export const updateSkillController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const skillId = req.params.skillId as string;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const skill = await updateSkill(skillId, req.body as any);

    sendSuccess(res, 200, skill, { message: "Skill updated successfully" });
  }
);
/**
 * @desc Delete an existing skill
 * @route /api/skills/:skillId
 * @method DELETE
 * @access private
 */
export const deleteSkillController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const skillId = req.params.skillId as string;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const result = await deleteSkill(skillId);

    sendSuccess(res, 200, undefined, { message: result.message });
  }
);
