// controllers/job.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { parsePagination } from "../utils/pagination";

/**
 * Saved-job HTTP adapter. It translates user requests and pagination only;
 * save/unsave consistency belongs to `savedJobs.service.ts`.
 */
import { getSaveJobs, toggleSaveJobs } from "../services/savedJobs.service";
import { sendSuccess } from "../utils/apiResponse";

/**
 * @desc Toggle save/unsave a job for the authenticated user
 * @route /api/jobs/saved/toggle
 * @method POST
 * @access private
 */
export const toggleSaveJobsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const { jobId } = req.body;

    if (!jobId) {
      throw new AppError("Job ID is required", 400);
    }

    const result = await toggleSaveJobs(userId, jobId);

    sendSuccess(
      res,
      200,
      { action: result.action },
      { message: result.message }
    );
  }
);

/**
 * @desc Get saved jobs for the authenticated user
 * @route /api/jobs/saved
 * @method GET
 * @access private
 */
export const getSaveJobsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const pagination = parsePagination(
      req.query as Record<string, string | string[] | undefined>,
      5
    );

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const savedJobs = await getSaveJobs(userId, pagination.page);

    sendSuccess(res, 200, savedJobs.jobs, {
      meta: {
        page: savedJobs.page,
        totalCount: savedJobs.totalCount,
        pageSize: savedJobs.pageSize,
      },
    });
  }
);
