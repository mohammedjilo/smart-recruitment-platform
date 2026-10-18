import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import {
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "../services/certificate.service.js";
import { sendSuccess } from "../utils/apiResponse";

export const createCertificateController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const certificate = await createCertificate(userId, req.body as any);

    sendSuccess(res, 201, certificate, {
      message: "Certificate created successfully",
    });
  }
);

export const updateCertificateController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const certificateId = req.params.certificateId as string;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const certificate = await updateCertificate(
      userId,
      certificateId,
      req.body as any
    );

    sendSuccess(res, 200, certificate, {
      message: "Certificate updated successfully",
    });
  }
);

export const deleteCertificateController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const certificateId = req.params.certificateId as string;

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const result = await deleteCertificate(userId, certificateId);

    sendSuccess(res, 200, undefined, { message: result.message });
  }
);
