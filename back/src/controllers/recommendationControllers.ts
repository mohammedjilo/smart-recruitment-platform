import { Request, Response } from "express";
import { getRecommendedJobs } from "../services/recommendation.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

/**
 * Recommendation HTTP adapter. It returns a fresh stateless result and never
 * persists recommendation records.
 */

/**
 * @desc Get recommended jobs for the authenticated user
 * @route /api/recommendation
 * @method GET
 * @access private
 */
export const recommendedJobs = asyncHandler(
  async (req: Request, res: Response) => {
    const jobs = await getRecommendedJobs(req.user!.id, req.requestId);

    sendSuccess(res, 200, jobs);
  }
);
