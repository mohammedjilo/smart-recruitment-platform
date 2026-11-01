import type { Request, Response } from "express";
import {
  getAdminApplicationCv,
  getAdminCandidateProfileCv,
  getCandidateApplicationCv,
  getCandidateProfileCv,
  getCompanyApplicationCv,
  replaceCandidateProfileCv,
} from "../services/cvAccess.service.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

const setNoStoreHeaders = (res: Response) => {
  res.set({
    "Cache-Control": "private, no-store, max-age=0",
    Pragma: "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
};

export const getApplicationCvController = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = req.params.applicationId as string;
    if (req.company && req.company.approvalStatus !== "APPROVED") {
      throw new AppError("Approved company access required", 403, "FORBIDDEN");
    }
    const authorization = req.company
      ? await getCompanyApplicationCv(applicationId, req.company.id)
      : req.user?.role === "USER"
        ? await getCandidateApplicationCv(applicationId, req.user.id)
        : (() => {
            throw new AppError("CV access is not authorized", 403, "FORBIDDEN");
          })();

    setNoStoreHeaders(res);
    sendSuccess(res, 200, authorization);
  }
);

export const getAdminApplicationCvController = asyncHandler(
  async (req: Request, res: Response) => {
    const authorization = await getAdminApplicationCv(
      req.params.applicationId as string
    );
    setNoStoreHeaders(res);
    sendSuccess(res, 200, authorization);
  }
);

export const getCandidateProfileCvController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== "USER") {
      throw new AppError("Candidate access required", 403, "FORBIDDEN");
    }
    const authorization = await getCandidateProfileCv(req.user.id);
    setNoStoreHeaders(res);
    sendSuccess(res, 200, authorization);
  }
);

export const getAdminCandidateProfileCvController = asyncHandler(
  async (req: Request, res: Response) => {
    const authorization = await getAdminCandidateProfileCv(
      req.params.userId as string
    );
    setNoStoreHeaders(res);
    sendSuccess(res, 200, authorization);
  }
);

export const replaceCandidateProfileCvController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== "USER") {
      throw new AppError("Candidate access required", 403, "FORBIDDEN");
    }
    if (!req.file) {
      throw new AppError("Resume PDF is required", 400, "RESUME_REQUIRED");
    }
    const result = await replaceCandidateProfileCv(req.user.id, req.file);
    sendSuccess(res, 200, result, {
      message: "CV securely uploaded successfully",
    });
  }
);
