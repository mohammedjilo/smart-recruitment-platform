import multer from "multer";
import { NextFunction, Request, Response } from "express";
import { AppError } from "./appError.js";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ["application/pdf"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only PDF files are allowed", 400, "INVALID_UPLOAD"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jfif",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Only JPEG, PNG, GIF, or WEBP images are allowed",
        400,
        "INVALID_UPLOAD"
      )
    );
  }
};

export const imageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const hasSignature = (file: Express.Multer.File, kind: "pdf" | "image") => {
  const buffer = file.buffer;
  if (kind === "pdf")
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  return (
    (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) ||
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
    buffer.subarray(0, 4).toString("ascii") === "GIF8" ||
    (buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP")
  );
};

export const validateUploadedFile =
  (kind: "pdf" | "image") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const files = req.file ? [req.file] : [];
    const multipartFiles = req.files;
    if (Array.isArray(multipartFiles)) files.push(...multipartFiles);
    if (multipartFiles && !Array.isArray(multipartFiles)) {
      Object.values(multipartFiles).forEach((group) => files.push(...group));
    }
    if (files.some((file) => !hasSignature(file, kind))) {
      return next(
        new AppError(
          "Uploaded file content does not match its allowed type",
          400,
          "INVALID_UPLOAD"
        )
      );
    }
    return next();
  };

export const handleUploadError =
  (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (error?: unknown) => {
      if (error instanceof multer.MulterError) {
        const message =
          error.code === "LIMIT_FILE_SIZE"
            ? "Uploaded file exceeds the 5 MB limit"
            : "Invalid multipart upload";
        return next(new AppError(message, 400, "INVALID_UPLOAD"));
      }
      return next(error);
    });
  };
