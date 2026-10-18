import { Request, Response } from "express";
import {
  loginAccount,
  refreshAccessToken,
  registerAccount,
  verifySupportAccessCredentials,
} from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import {
  clearRefreshCookie,
  clearSupportAccessCookie,
  setRefreshCookie,
  setSupportAccessCookie,
} from "../utils/cookies";
import { AppError } from "../utils/appError.js";
import { sendSuccess } from "../utils/apiResponse";
import { signSupportOnlyToken } from "../utils/tokens.js";

/**
 * Authentication HTTP adapter. It validates transport input, manages the
 * refresh cookie, and delegates credential/token work to `auth.service.ts`.
 * It must never expose stored credentials or implement authentication rules.
 */

/**
 * @desc Register a new user or company
 * @route /api/auth/register
 * @method POST
 * @access public
 */
export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;

    const uploadedFile =
      files?.image?.[0] ?? files?.logo?.[0] ?? files?.file?.[0] ?? undefined;

    const registration = await registerAccount(req.body, uploadedFile);

    if (typeof registration === "object") {
      sendSuccess(res, 201, registration, {
        message: registration.resubmitted
          ? "Company registration resubmitted for review"
          : "Company registration submitted for review",
      });
      return;
    }

    sendSuccess(res, 201, undefined, { message: "Registered successfully" });
  }
);

/**
 * @desc Login a user or company
 * @route /api/auth/login
 * @method POST
 * @access public
 */
export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    let result: Awaited<ReturnType<typeof loginAccount>>;
    try {
      result = await loginAccount(req.body);
    } catch (error) {
      if (error instanceof AppError && error.code === "ACCOUNT_DEACTIVATED") {
        clearRefreshCookie(res);
      }
      throw error;
    }

    if ("registrationStatus" in result) {
      clearRefreshCookie(res);
      sendSuccess(res, 200, result, {
        message:
          result.registrationStatus === "PENDING"
            ? "Company registration is under review"
            : "Company registration was rejected",
      });
      return;
    }

    setRefreshCookie(res, result.refreshToken);
    const { refreshToken: _refreshToken, ...safeResult } = result;

    sendSuccess(res, 200, safeResult, { message: "Login successful" });
  }
);

export const supportAccessController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await verifySupportAccessCredentials(req.body);

    if (result.mode === "active") {
      clearSupportAccessCookie(res);
      sendSuccess(res, 200, { mode: "active" as const });
      return;
    }

    clearRefreshCookie(res);
    const token = signSupportOnlyToken(result.accountId, result.accountType);
    setSupportAccessCookie(res, token);
    sendSuccess(res, 200, { mode: "support_only" as const });
  }
);

export const supportAccessLogoutController = asyncHandler(
  async (_req: Request, res: Response) => {
    clearSupportAccessCookie(res);
    sendSuccess(res, 200, undefined, { message: "Support access ended" });
  }
);

/**
 * @desc Logout user or company
 * @route /api/auth/logout
 * @method POST
 * @access public
 */
export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    clearRefreshCookie(res);

    sendSuccess(res, 200, undefined, { message: "Logged out successfully" });
  }
);

export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (typeof refreshToken !== "string" || refreshToken.length === 0) {
      throw new AppError("Refresh token is required", 401);
    }
    try {
      const token = await refreshAccessToken(refreshToken);
      sendSuccess(res, 200, { token });
    } catch (error) {
      if (error instanceof AppError && error.code === "ACCOUNT_DEACTIVATED") {
        clearRefreshCookie(res);
      }
      throw error;
    }
  }
);
