import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { z } from "zod";
import { AppError } from "../utils/appError.js";
import { Prisma } from "@prisma/client";
import { markGlobalErrorResponse } from "./globalErrorResponse.js";
import {
  getErrorClassification,
  type ErrorClassification,
  type ErrorCode,
  type ErrorSource,
} from "../utils/appError.js";
import {
  getErrorDiagnostics,
  writeStructuredLog,
} from "../utils/structuredLogger.js";

type NormalizedError = {
  statusCode: number;
  code: ErrorCode;
  message: string;
  classification: ErrorClassification;
  source: ErrorSource;
  fieldErrors?: Record<string, string>;
};

const expectedError = (
  statusCode: number,
  code: ErrorCode,
  message: string,
  source: ErrorSource,
  fieldErrors?: Record<string, string>
): NormalizedError => ({
  statusCode,
  code,
  message,
  source,
  classification: getErrorClassification(code),
  ...(fieldErrors ? { fieldErrors } : {}),
});

const unexpectedError = (
  statusCode: number,
  code: ErrorCode,
  message: string,
  source: ErrorSource
): NormalizedError => ({
  statusCode,
  code,
  message,
  source,
  classification: "unexpected",
});

const getFieldErrors = (error: z.ZodError) =>
  error.issues.reduce<Record<string, string>>((fieldErrors, issue) => {
    const field = issue.path.join(".") || "form";
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    return fieldErrors;
  }, {});

const normalizePrismaError = (error: unknown): NormalizedError | undefined => {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    if (error.errorCode === "P1002") {
      return unexpectedError(
        504,
        "TIMEOUT",
        "The database request timed out",
        "database"
      );
    }

    return unexpectedError(
      503,
      "SERVICE_UNAVAILABLE",
      "The database is temporarily unavailable",
      "database"
    );
  }

  if (
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    return unexpectedError(
      503,
      "DATABASE_FAILURE",
      "The database operation could not be completed",
      "database"
    );
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return unexpectedError(
      500,
      "DATABASE_FAILURE",
      "The database operation could not be completed",
      "database"
    );
  }

  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return undefined;
  }

  switch (error.code) {
    case "P2002":
      return expectedError(
        409,
        "DUPLICATE_RESOURCE",
        "A resource with these details already exists",
        "database"
      );
    case "P2025":
      return expectedError(
        404,
        "RESOURCE_NOT_FOUND",
        "The requested resource could not be found",
        "database"
      );
    case "P2003":
      return expectedError(
        400,
        "INVALID_RELATION",
        "A related resource is invalid",
        "database"
      );
    case "P2014":
    case "P2034":
      return expectedError(
        409,
        "CONFLICT",
        "The requested change conflicts with the current resource state",
        "database"
      );
    case "P2024":
      return unexpectedError(
        503,
        "SERVICE_UNAVAILABLE",
        "The database is temporarily unavailable",
        "database"
      );
    default:
      return unexpectedError(
        500,
        "DATABASE_FAILURE",
        "A database operation failed",
        "database"
      );
  }
};

const normalizeBodyParserError = (
  error: unknown
): NormalizedError | undefined => {
  if (!(error instanceof Error)) return undefined;

  const parserError = error as Error & { type?: string };
  switch (parserError.type) {
    case "entity.parse.failed":
      return expectedError(
        400,
        "BAD_REQUEST",
        "The request body contains invalid JSON",
        "body-parser"
      );
    case "entity.too.large":
      return expectedError(
        413,
        "PAYLOAD_TOO_LARGE",
        "The request body is too large",
        "body-parser"
      );
    case "request.aborted":
    case "request.size.invalid":
      return expectedError(
        400,
        "BAD_REQUEST",
        "The request body is invalid",
        "body-parser"
      );
    default:
      return undefined;
  }
};

const normalizeError = (error: unknown): NormalizedError => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      classification: error.classification,
      source: error.source,
      ...(error.fieldErrors && Object.keys(error.fieldErrors).length > 0
        ? { fieldErrors: error.fieldErrors }
        : {}),
    };
  }

  if (error instanceof z.ZodError) {
    return expectedError(
      400,
      "VALIDATION_ERROR",
      "Validation failed",
      "validation",
      getFieldErrors(error)
    );
  }

  if (error instanceof multer.MulterError) {
    return expectedError(
      400,
      "INVALID_UPLOAD",
      error.code === "LIMIT_FILE_SIZE"
        ? "Uploaded file exceeds the 5 MB limit"
        : "Invalid multipart upload",
      "upload"
    );
  }

  const prismaError = normalizePrismaError(error);
  if (prismaError) return prismaError;

  const bodyParserError = normalizeBodyParserError(error);
  if (bodyParserError) return bodyParserError;

  return unexpectedError(
    500,
    "INTERNAL_ERROR",
    "An unexpected error occurred",
    "internal"
  );
};

const logUnexpectedError = (
  error: unknown,
  normalized: NormalizedError,
  req: Request
) => {
  if (normalized.classification !== "unexpected") return;

  writeStructuredLog("error", "api.request.failed", {
    requestId: req.requestId ?? "unknown",
    errorCode: normalized.code,
    httpStatus: normalized.statusCode,
    route: req.route ? `${req.baseUrl}${req.route.path}` : req.path,
    method: req.method,
    classification: normalized.classification,
    source: normalized.source,
    ...getErrorDiagnostics(error),
  });
};

export const notFoundHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => next(new AppError("Route not found", 404, "RESOURCE_NOT_FOUND"));

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  const normalized = normalizeError(err);
  logUnexpectedError(err, normalized, req);

  markGlobalErrorResponse(res);
  return res.status(normalized.statusCode).json({
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      ...(normalized.fieldErrors
        ? { fieldErrors: normalized.fieldErrors }
        : {}),
    },
    ...(req.requestId ? { requestId: req.requestId } : {}),
  });
};
