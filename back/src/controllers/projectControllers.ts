import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import { createProject, updateProject } from "../services/project.service.js";
import { sendSuccess } from "../utils/apiResponse";
/**
 * @desc Create a new project for the authenticated user
 * @route /api/project
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
 * @route /api/project/:projectId
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
