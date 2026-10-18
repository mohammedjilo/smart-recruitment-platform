import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import {
  createProject,
  updateProject,
  deleteProject,
} from "../services/project.service.js";
import { sendSuccess } from "../utils/apiResponse";
/**
 * @desc Create a new project for the authenticated user
 * @route /api/projects
 * @method POST
 * @access private
 */
export const createProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const project = await createProject(userId, req.body as any);

    sendSuccess(res, 201, project, { message: "Project created successfully" });
  }
);
/**
 * @desc Update an existing project for the authenticated user
 * @route /api/projects/:projectId
 * @method PUT
 * @access private
 */
export const updateProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const projectId = req.params.projectId as string;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const project = await updateProject(userId, projectId, req.body as any);

    sendSuccess(res, 200, project, { message: "Project updated successfully" });
  }
);
/**
 * @desc Delete an existing project for the authenticated user
 * @route /api/projects/:projectId
 * @method DELETE
 * @access private
 */
export const deleteProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const projectId = req.params.projectId as string;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const result = await deleteProject(userId, projectId);

    sendSuccess(res, 200, undefined, { message: result.message });
  }
);
