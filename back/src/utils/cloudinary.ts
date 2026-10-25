// cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";
import "dotenv/config";
import { AppError } from "./appError.js";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUploadImage = async (
  fileToUpload: string | Buffer,
  mimetype?: string
): Promise<UploadApiResponse> => {
  try {
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

    const result = await cloudinary.uploader.upload(uploadData, {
      resource_type: "raw",
      folder: "applications/cvs",
    });

    return result;
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
