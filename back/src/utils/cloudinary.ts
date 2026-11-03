// cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";
import "dotenv/config";
import { AppError } from "./appError.js";
const ensureCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to the environment.",
      503,
      "SERVICE_UNAVAILABLE",
      undefined,
      { source: "cloudinary", classification: "unexpected" }
    );
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const CV_UPLOAD_OPTIONS = {
  resource_type: "raw",
  type: "authenticated",
  folder: "applications/cvs",
} as const;

export const uploadRestrictedCv = async <
  T extends {
    resource_type: string;
    type: string;
  },
>(
  upload: (data: string, options: typeof CV_UPLOAD_OPTIONS) => Promise<T>,
  uploadData: string
) => {
  const result = await upload(uploadData, CV_UPLOAD_OPTIONS);
  if (result.resource_type !== "raw" || result.type !== "authenticated") {
    throw new AppError(
      "CV storage did not confirm restricted delivery",
      502,
      "CV_STORAGE_UNAVAILABLE"
    );
  }
  return result;
};

export const cloudinaryUploadImage = async (
  fileToUpload: string | Buffer,
  mimetype?: string
): Promise<UploadApiResponse> => {
  try {
    ensureCloudinaryConfig();

    let uploadData: string;
    if (Buffer.isBuffer(fileToUpload)) {
      if (!mimetype) {
        throw new AppError("Invalid upload data", 400, "INVALID_UPLOAD");
      }
      const base64 = fileToUpload.toString("base64");
      uploadData = `data:${mimetype};base64,${base64}`;
    } else {
      uploadData = fileToUpload;
    }

    const data = await cloudinary.uploader.upload(uploadData, {
      resource_type: "auto",
    });
    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Image upload failed",
      502,
      "SERVICE_UNAVAILABLE",
      undefined,
      { cause: error, source: "cloudinary", classification: "unexpected" }
    );
  }
};
export const cloudinaryUploadCV = async (
  file: Buffer,
  mimetype: string
): Promise<UploadApiResponse> => {
  ensureCloudinaryConfig();

  if (
    file.length > 5 * 1024 * 1024 ||
    mimetype !== "application/pdf" ||
    file.subarray(0, 5).toString("ascii") !== "%PDF-"
  ) {
    throw new AppError("Invalid PDF file", 400);
  }

  try {
    const base64 = file.toString("base64");

    const uploadData = `data:${mimetype};base64,${base64}`;

    return await uploadRestrictedCv(
      (data, options) => cloudinary.uploader.upload(data, options),
      uploadData
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "CV upload failed",
      502,
      "SERVICE_UNAVAILABLE",
      undefined,
      { cause: error, source: "cloudinary", classification: "unexpected" }
    );
  }
};

export const cloudinaryPrivateCvDownloadUrl = (
  publicId: string,
  expiresAt: number
) =>
  cloudinary.utils.private_download_url(publicId, "pdf", {
    resource_type: "raw",
    type: "authenticated",
    expires_at: expiresAt,
    attachment: true,
  });
