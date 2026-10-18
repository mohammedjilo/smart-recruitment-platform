export type GenericErrorCode =
  | "BAD_REQUEST"
  | "CONFLICT"
  | "DATABASE_FAILURE"
  | "DUPLICATE_RESOURCE"
  | "FORBIDDEN"
  | "INTERNAL_ERROR"
  | "INVALID_RELATION"
  | "INVALID_UPLOAD"
  | "PAYLOAD_TOO_LARGE"
  | "RATE_LIMITED"
  | "RESOURCE_NOT_FOUND"
  | "SERVICE_UNAVAILABLE"
  | "TIMEOUT"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR";

export type DomainErrorCode =
  | "AI_INVALID_RESPONSE"
  | "AI_TIMEOUT"
  | "AI_UNAVAILABLE"
  | "APPLICATION_STATUS_FINAL"
  | "ACCOUNT_DEACTIVATED"
  | "COMPANY_ALREADY_REGISTERED"
  | "COMPANY_NOT_APPROVED"
  | "COMPANY_NOT_FOUND"
  | "COMPANY_REGISTRATION_PENDING"
  | "DUPLICATE_APPLICATION"
  | "INVALID_APPLICATION_STATUS_TRANSITION"
  | "INVALID_PAGINATION"
  | "INVALID_QUESTION_ANSWER"
  | "JOB_DEADLINE_INVALID"
  | "JOB_DEADLINE_PASSED"
  | "JOB_NOT_FOUND"
  | "JOB_NOT_OPEN"
  | "JOB_NOT_OWNED"
  | "JOB_REOPEN_DEADLINE_REQUIRED"
  | "QUESTION_HAS_HISTORICAL_ANSWERS"
  | "QUESTION_JOB_MISMATCH"
  | "REQUIRED_QUESTION_MISSING"
  | "RESUME_REQUIRED"
  | "USER_NOT_FOUND"
  | "WITHDRAWN_APPLICATION_HISTORY_IMMUTABLE";

export type ErrorCode = GenericErrorCode | DomainErrorCode;

export type ErrorClassification = "expected" | "unexpected";

export type ErrorSource =
  | "application"
  | "authentication"
  | "authorization"
  | "body-parser"
  | "cloudinary"
  | "database"
  | "google-ai"
  | "internal"
  | "notification"
  | "upload"
  | "validation";

export type AppErrorOptions = ErrorOptions & {
  classification?: ErrorClassification;
  source?: ErrorSource;
};

const expectedErrorCodes = new Set<ErrorCode>([
  "BAD_REQUEST",
  "CONFLICT",
  "DUPLICATE_RESOURCE",
  "FORBIDDEN",
  "INVALID_RELATION",
  "INVALID_UPLOAD",
  "PAYLOAD_TOO_LARGE",
  "RATE_LIMITED",
  "RESOURCE_NOT_FOUND",
  "UNAUTHORIZED",
  "VALIDATION_ERROR",
  "APPLICATION_STATUS_FINAL",
  "ACCOUNT_DEACTIVATED",
  "COMPANY_ALREADY_REGISTERED",
  "COMPANY_NOT_APPROVED",
  "COMPANY_NOT_FOUND",
  "COMPANY_REGISTRATION_PENDING",
  "DUPLICATE_APPLICATION",
  "INVALID_APPLICATION_STATUS_TRANSITION",
  "INVALID_PAGINATION",
  "INVALID_QUESTION_ANSWER",
  "JOB_DEADLINE_INVALID",
  "JOB_DEADLINE_PASSED",
  "JOB_NOT_FOUND",
  "JOB_NOT_OPEN",
  "JOB_NOT_OWNED",
  "JOB_REOPEN_DEADLINE_REQUIRED",
  "QUESTION_HAS_HISTORICAL_ANSWERS",
  "QUESTION_JOB_MISMATCH",
  "REQUIRED_QUESTION_MISSING",
  "RESUME_REQUIRED",
  "USER_NOT_FOUND",
  "WITHDRAWN_APPLICATION_HISTORY_IMMUTABLE",
]);

const sourceByCode: Partial<Record<ErrorCode, ErrorSource>> = {
  ACCOUNT_DEACTIVATED: "authorization",
  UNAUTHORIZED: "authentication",
  FORBIDDEN: "authorization",
  VALIDATION_ERROR: "validation",
  INVALID_PAGINATION: "validation",
  INVALID_UPLOAD: "upload",
  INVALID_RELATION: "database",
  DUPLICATE_RESOURCE: "database",
  RESOURCE_NOT_FOUND: "database",
  COMPANY_NOT_FOUND: "database",
  JOB_NOT_FOUND: "database",
  USER_NOT_FOUND: "database",
  SERVICE_UNAVAILABLE: "database",
  DATABASE_FAILURE: "database",
  TIMEOUT: "database",
  AI_INVALID_RESPONSE: "google-ai",
  AI_TIMEOUT: "google-ai",
  AI_UNAVAILABLE: "google-ai",
};

const expectedDatabaseErrorCodes = new Set<ErrorCode>([
  "CONFLICT",
  "DUPLICATE_APPLICATION",
  "DUPLICATE_RESOURCE",
  "INVALID_RELATION",
  "RESOURCE_NOT_FOUND",
  "COMPANY_NOT_FOUND",
  "JOB_NOT_FOUND",
  "USER_NOT_FOUND",
]);

export const getErrorClassification = (
  code: ErrorCode,
  source: ErrorSource = sourceByCode[code] ?? "application"
): ErrorClassification => {
  if (source === "cloudinary" || source === "google-ai") {
    return "unexpected";
  }
  if (source === "database" && !expectedDatabaseErrorCodes.has(code)) {
    return "unexpected";
  }
  return expectedErrorCodes.has(code) ? "expected" : "unexpected";
};

export const getErrorSource = (code: ErrorCode): ErrorSource =>
  sourceByCode[code] ?? "application";

const defaultCodeByStatus: Record<number, GenericErrorCode> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "RESOURCE_NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  422: "VALIDATION_ERROR",
  429: "RATE_LIMITED",
  502: "SERVICE_UNAVAILABLE",
  503: "SERVICE_UNAVAILABLE",
  504: "TIMEOUT",
};

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code: ErrorCode;
  classification: ErrorClassification;
  source: ErrorSource;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    statusCode = 500,
    code: ErrorCode = defaultCodeByStatus[statusCode] ??
      (statusCode >= 500 ? "INTERNAL_ERROR" : "BAD_REQUEST"),
    fieldErrors?: Record<string, string>,
    options?: AppErrorOptions
  ) {
    super(message, options);
    this.statusCode = statusCode;
    this.code = code;
    this.source = options?.source ?? getErrorSource(code);
    this.classification =
      options?.classification ?? getErrorClassification(code, this.source);
    this.isOperational = this.classification === "expected";
    this.fieldErrors = fieldErrors;

    Error.captureStackTrace(this, this.constructor);
  }
}

// export class ValidationError extends AppError {
//   constructor(message = "Invalid request data") {
//     super(message, 400, "VALIDATION_ERROR");
//   }
// }

// export class NotFoundError extends AppError {
//   constructor(
//     message = "Resource not found",
//     code: ErrorCode = "RESOURCE_NOT_FOUND"
//   ) {
//     super(message, 404, code);
//   }
// }
