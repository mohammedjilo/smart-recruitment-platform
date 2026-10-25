import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import {
  getAdminDashboard,
  getOperationsDashboard,
} from "../../services/admin/adminDashboard.service";

/**
 * @desc Get the administration dashboard
 * @route /api/admin/dashboard
 * @method GET
 * @access private
 */
export const getAdminDashboardController = asyncHandler(
  async (req: Request, res: Response) => {
    const dashboard = await getAdminDashboard(req.user!.id);
    sendSuccess(res, 200, dashboard);
  }
);

/**
 * @desc Get the operations dashboard
 * @route /api/admin/operations/dashboard
 * @method GET
 * @access private
 */
export const getOperationsDashboardController = asyncHandler(
  async (req: Request, res: Response) => {
    const dashboard = await getOperationsDashboard(req.user!.id);
    sendSuccess(res, 200, dashboard);
  }
);
