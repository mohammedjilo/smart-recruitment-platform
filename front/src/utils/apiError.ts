export type ApiErrorKind =
   | "validation"
   | "authentication"
   | "authorization"
   | "not_found"
   | "conflict"
   | "business"
   | "upload"
   | "network"
   | "timeout"
   | "rate_limited"
   | "service_unavailable"
   | "server"
   | "client"
   | "aborted"
   | "unknown"

export interface NormalizedApiError {
   kind: ApiErrorKind
   code: string
   message: string
   status?: number
   fieldErrors?: Record<string, string>
   requestId?: string
   retryable: boolean
   isAborted: boolean
}

interface BackendErrorEnvelope {
   success: false
   error: {
      code: string
      message: string
      fieldErrors?: Record<string, string>
   }
   requestId?: string
}

const genericMessage = "Something went wrong. Please try again later."
const networkMessage = "Unable to connect to the server. Please try again."

const infrastructureCodes: Record<string, ApiErrorKind> = {
   BAD_REQUEST: "client",
   DATABASE_FAILURE: "server",
   INTERNAL_ERROR: "server",
   INVALID_PAGINATION: "validation",
   INVALID_RELATION: "validation",
   INVALID_UPLOAD: "upload",
   PAYLOAD_TOO_LARGE: "client",
   RATE_LIMITED: "rate_limited",
   RESOURCE_NOT_FOUND: "not_found",
   SERVICE_UNAVAILABLE: "service_unavailable",
   TIMEOUT: "timeout",
   UNAUTHORIZED: "authentication",
   FORBIDDEN: "authorization",
   VALIDATION_ERROR: "validation"
}

const conflictCodes = new Set([
   "CONFLICT",
   "COMPANY_ALREADY_REGISTERED",
   "COMPANY_REGISTRATION_PENDING",
   "DUPLICATE_APPLICATION",
   "DUPLICATE_RESOURCE",
   "APPLICATION_STATUS_FINAL",
   "INVALID_APPLICATION_STATUS_TRANSITION",
   "QUESTION_HAS_HISTORICAL_ANSWERS",
   "WITHDRAWN_APPLICATION_HISTORY_IMMUTABLE"
])

const businessCodes = new Set([
   "ACCOUNT_DEACTIVATED",
   "COMPANY_NOT_APPROVED",
   "INVALID_QUESTION_ANSWER",
   "JOB_DEADLINE_INVALID",
   "JOB_DEADLINE_PASSED",
   "JOB_NOT_OPEN",
   "JOB_NOT_OWNED",
   "JOB_REOPEN_DEADLINE_REQUIRED",
   "QUESTION_JOB_MISMATCH",
   "REQUIRED_QUESTION_MISSING",
   "RESUME_REQUIRED"
])

const externalServiceCodes: Record<string, ApiErrorKind> = {
   AI_INVALID_RESPONSE: "service_unavailable",
   AI_TIMEOUT: "timeout",
   AI_UNAVAILABLE: "service_unavailable"
}

const knownKinds = new Set<ApiErrorKind>([
   "validation",
   "authentication",
   "authorization",
   "not_found",
   "conflict",
   "business",
   "upload",
   "network",
   "timeout",
   "rate_limited",
   "service_unavailable",
   "server",
   "client",
   "aborted",
   "unknown"
])

const isRecord = (value: unknown): value is Record<string, unknown> =>
   typeof value === "object" && value !== null

const isStringRecord = (value: unknown): value is Record<string, string> =>
   isRecord(value) && Object.values(value).every(item => typeof item === "string")

const isBackendErrorEnvelope = (value: unknown): value is BackendErrorEnvelope => {
   if (!isRecord(value) || value.success !== false || !isRecord(value.error)) return false
   if (typeof value.error.code !== "string" || !value.error.code.trim()) return false
   if (typeof value.error.message !== "string" || !value.error.message.trim()) return false
   if (
      value.error.fieldErrors !== undefined &&
      !isStringRecord(value.error.fieldErrors)
   )
      return false
   return value.requestId === undefined || typeof value.requestId === "string"
}

const isNormalizedApiError = (value: unknown): value is NormalizedApiError =>
   isRecord(value) &&
   typeof value.kind === "string" &&
   knownKinds.has(value.kind as ApiErrorKind) &&
   typeof value.code === "string" &&
   /^[A-Z][A-Z0-9_]{0,127}$/.test(value.code) &&
   !/^P\d{4}$/i.test(value.code) &&
   !/^PRISMA(?:_|$)/i.test(value.code) &&
   typeof value.message === "string" &&
   typeof value.retryable === "boolean" &&
   typeof value.isAborted === "boolean" &&
   (value.status === undefined || typeof value.status === "number") &&
   (value.fieldErrors === undefined || isStringRecord(value.fieldErrors)) &&
   (value.requestId === undefined || typeof value.requestId === "string")

const fallbackKindForStatus = (status?: number): ApiErrorKind => {
   if (status === 400) return "client"
   if (status === 401) return "authentication"
   if (status === 403) return "authorization"
   if (status === 404) return "not_found"
   if (status === 408 || status === 504) return "timeout"
   if (status === 409) return "conflict"
   if (status === 413) return "client"
   if (status === 429) return "rate_limited"
   if (status === 502 || status === 503) return "service_unavailable"
   if (status !== undefined && status >= 500) return "server"
   return "unknown"
}

const kindForCode = (code: string, status?: number): ApiErrorKind => {
   if (infrastructureCodes[code]) return infrastructureCodes[code]
   if (externalServiceCodes[code]) return externalServiceCodes[code]
   if (conflictCodes.has(code)) return "conflict"
   if (businessCodes.has(code)) return "business"
   if (code.endsWith("_NOT_FOUND")) return "not_found"
   return fallbackKindForStatus(status)
}

const isSensitiveMessage = (message: string) =>
   /\bBearer\s+\S+/i.test(message) ||
   /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\//i.test(message) ||
   /\bPrisma[A-Za-z]*|\bSQLSTATE\b|\b(?:ECONNREFUSED|ECONNRESET|ENOTFOUND|ETIMEDOUT)\b/i.test(
      message
   ) ||
   /\b(?:password|secret|api[_-]?key|access[_-]?token|refresh[_-]?token)\s*[:=]\s*\S+/i.test(
      message
   ) ||
   /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/.test(message) ||
   /(?:[A-Za-z]:\\|\/(?:home|Users|var|etc|srv|app)\/)[^\s]*/.test(message) ||
   /\bat\s+\S+\s*\([^)]+:\d+:\d+\)/.test(message)

const safeRequestId = (requestId?: string) =>
   requestId && requestId.length <= 128 && /^[A-Za-z0-9._:-]+$/.test(requestId)
      ? requestId
      : undefined

const safeFieldErrors = (fieldErrors: Record<string, string>) =>
   Object.fromEntries(
      Object.entries(fieldErrors)
         .filter(([field]) => /^[A-Za-z_][A-Za-z0-9_.[\]-]{0,127}$/.test(field))
         .map(([field, message]) => [
            field,
            isSensitiveMessage(message) ? "Invalid value." : message
         ])
   )

const publicMessage = (message: string, kind: ApiErrorKind) => {
   if (!message.trim() || isSensitiveMessage(message)) return genericMessage
   if (kind === "authentication")
      return "Your session has expired. Please sign in again."
   if (kind === "authorization")
      return "You do not have permission to perform this action."
   if (kind === "network") return networkMessage
   if (kind === "aborted") return "The request was cancelled."
   return message
}

const retryableFor = (kind: ApiErrorKind, status?: number) =>
   kind === "network" ||
   kind === "timeout" ||
   kind === "service_unavailable" ||
   kind === "rate_limited" ||
   (status !== undefined && status >= 500 && status !== 501)

const normalizedError = (
   kind: ApiErrorKind,
   code: string,
   message: string,
   options: {
      status?: number
      fieldErrors?: Record<string, string>
      requestId?: string
   } = {}
): NormalizedApiError => ({
   kind,
   code,
   message: publicMessage(message, kind),
   ...(options.status === undefined ? {} : { status: options.status }),
   ...(options.fieldErrors === undefined
      ? {}
      : { fieldErrors: safeFieldErrors(options.fieldErrors) }),
   ...(safeRequestId(options.requestId)
      ? { requestId: safeRequestId(options.requestId) }
      : {}),
   retryable: retryableFor(kind, options.status),
   isAborted: kind === "aborted"
})

const statusFor = (value: Record<string, unknown>): number | undefined => {
   if (typeof value.status === "number") return value.status
   if (typeof value.originalStatus === "number") return value.originalStatus
   return undefined
}

const errorName = (value: Record<string, unknown>) =>
   typeof value.name === "string" ? value.name : ""

const errorText = (value: Record<string, unknown>) =>
   typeof value.error === "string" ? value.error : ""

const genericCodeForKind = (kind: ApiErrorKind) => {
   switch (kind) {
      case "network":
         return "NETWORK_ERROR"
      case "timeout":
         return "TIMEOUT"
      case "aborted":
         return "REQUEST_ABORTED"
      default:
         return "UNKNOWN_ERROR"
   }
}

export const normalizeApiError = (input: unknown): NormalizedApiError => {
   if (isNormalizedApiError(input)) {
      return normalizedError(input.kind, input.code, input.message, {
         ...(input.status === undefined ? {} : { status: input.status }),
         ...(input.fieldErrors === undefined ? {} : { fieldErrors: input.fieldErrors }),
         ...(input.requestId === undefined ? {} : { requestId: input.requestId })
      })
   }

   if (!isRecord(input))
      return normalizedError("unknown", "UNKNOWN_ERROR", genericMessage)

   if (errorName(input) === "AbortError" || errorName(input) === "CanceledError") {
      return normalizedError("aborted", "REQUEST_ABORTED", "The request was cancelled.")
   }

   const status = statusFor(input)
   const transportError = errorText(input)
   if (
      input.status === "TIMEOUT_ERROR" ||
      errorName(input) === "TimeoutError"
   ) {
      return normalizedError("timeout", "TIMEOUT", genericMessage, { status })
   }
   if (
      input.status === "FETCH_ERROR" &&
      /\b(?:AbortError|CanceledError)\b/i.test(transportError)
   ) {
      return normalizedError("aborted", "REQUEST_ABORTED", "The request was cancelled.")
   }
   if (input.status === "FETCH_ERROR") {
      return normalizedError("network", "NETWORK_ERROR", networkMessage)
   }

   const data = input.data
   if (isBackendErrorEnvelope(data)) {
      const kind = kindForCode(data.error.code, status)
      const code =
         !/^[A-Z][A-Z0-9_]{0,127}$/.test(data.error.code) ||
         /^P\d{4}$/i.test(data.error.code) ||
         /^PRISMA(?:_|$)/i.test(data.error.code)
            ? genericCodeForKind(kind)
            : data.error.code
      const cleanFieldErrors =
         data.error.fieldErrors === undefined
            ? undefined
            : safeFieldErrors(data.error.fieldErrors)
      return normalizedError(kind, code, data.error.message, {
         ...(status === undefined ? {} : { status }),
         ...(cleanFieldErrors === undefined ? {} : { fieldErrors: cleanFieldErrors }),
         ...(data.requestId ? { requestId: data.requestId } : {})
      })
   }

   const kind = fallbackKindForStatus(status)
   return normalizedError(kind, genericCodeForKind(kind), genericMessage, {
      ...(status === undefined ? {} : { status })
   })
}
