import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import {
  createCertificate,
  updateCertificate,
} from "../services/certificate.service.js";
import { sendSuccess } from "../utils/apiResponse";

/**
 * @desc Add a certificate to the authenticated user's profile
 * @route /api/certificate
 * @method POST
 * @access private
 */
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

/**
 * @desc Update a certificate in the authenticated user's profile
 * @route /api/certificate/:certificateId
 * @method PUT
 * @access private
 */
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
