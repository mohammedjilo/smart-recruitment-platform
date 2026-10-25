import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

/**
 * @desc Get the current support-only session details
 * @route /api/support-only/session
 * @method GET
 * @access private
 */
export const getSupportOnlySessionController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(res, 200, {
      mode: "support_only" as const,
      accountType: req.supportOnlyAccountType,
    });
  }
);
