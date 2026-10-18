import assert from "node:assert/strict"
import test from "node:test"
import { normalizeApiError } from "../src/utils/apiError.ts"

test("normalizes Backend validation errors and preserves safe contract metadata", () => {
   const result = normalizeApiError({
      status: 400,
      data: {
         success: false,
         error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            fieldErrors: { email: "Invalid email" }
         },
         requestId: "req-123"
      }
   })

   assert.equal(result.kind, "validation")
   assert.equal(result.code, "VALIDATION_ERROR")
   assert.equal(result.message, "Validation failed")
   assert.equal(result.status, 400)
   assert.deepEqual(result.fieldErrors, { email: "Invalid email" })
   assert.equal(result.requestId, "req-123")
   assert.equal(result.retryable, false)
   assert.equal(result.isAborted, false)
})

test("keeps domain codes while classifying their meaning", () => {
   const result = normalizeApiError({
      status: 409,
      data: {
         success: false,
         error: { code: "DUPLICATE_APPLICATION", message: "Already applied" }
      }
   })

   test("preserves the structured deactivated-account code for global handling", () => {
      const result = normalizeApiError({
         status: 403,
         data: {
            success: false,
            error: {
               code: "ACCOUNT_DEACTIVATED",
               message: "Your account has been deactivated."
            }
         }
      })

      assert.equal(result.code, "ACCOUNT_DEACTIVATED")
      assert.equal(result.kind, "business")
   })

   assert.equal(result.kind, "conflict")
   assert.equal(result.code, "DUPLICATE_APPLICATION")
   assert.equal(result.message, "Already applied")
})

test("classifies external service errors without renaming their codes", () => {
   const result = normalizeApiError({
      status: 504,
      data: {
         success: false,
         error: { code: "AI_TIMEOUT", message: "The operation timed out" }
      }
   })

   assert.equal(result.kind, "timeout")
   assert.equal(result.code, "AI_TIMEOUT")
   assert.equal(result.retryable, true)
})

test("maps the Backend error-code catalogue to stable semantic kinds", () => {
   const mappings = {
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
      VALIDATION_ERROR: "validation",
      COMPANY_NOT_FOUND: "not_found",
      JOB_NOT_FOUND: "not_found",
      USER_NOT_FOUND: "not_found",
      CONFLICT: "conflict",
      DUPLICATE_APPLICATION: "conflict",
      DUPLICATE_RESOURCE: "conflict",
      APPLICATION_STATUS_FINAL: "conflict",
      INVALID_APPLICATION_STATUS_TRANSITION: "conflict",
      QUESTION_HAS_HISTORICAL_ANSWERS: "conflict",
      WITHDRAWN_APPLICATION_HISTORY_IMMUTABLE: "conflict",
      COMPANY_NOT_APPROVED: "business",
      INVALID_QUESTION_ANSWER: "business",
      JOB_DEADLINE_INVALID: "business",
      JOB_DEADLINE_PASSED: "business",
      JOB_NOT_OPEN: "business",
      JOB_NOT_OWNED: "business",
      JOB_REOPEN_DEADLINE_REQUIRED: "business",
      QUESTION_JOB_MISMATCH: "business",
      REQUIRED_QUESTION_MISSING: "business",
      RESUME_REQUIRED: "business",
      AI_INVALID_RESPONSE: "service_unavailable",
      AI_TIMEOUT: "timeout",
      AI_UNAVAILABLE: "service_unavailable"
   }

   for (const [code, kind] of Object.entries(mappings)) {
      const result = normalizeApiError({
         status: 400,
         data: { success: false, error: { code, message: "Safe public message" } }
      })
      assert.equal(result.kind, kind, code)
      assert.equal(result.code, code, code)
   }
})

test("normalizes network and timeout failures without exposing transport details", () => {
   const network = normalizeApiError({
      status: "FETCH_ERROR",
      error: "TypeError: secret connection detail"
   })
   const timeout = normalizeApiError({
      status: "TIMEOUT_ERROR",
      error: "request timeout at C:\\private\\service.ts:10"
   })

   assert.equal(network.kind, "network")
   assert.equal(network.message, "Unable to connect to the server. Please try again.")
   assert.equal(network.retryable, true)
   assert.equal(timeout.kind, "timeout")
   assert.equal(timeout.retryable, true)
   assert.doesNotMatch(JSON.stringify({ network, timeout }), /secret|private|service\.ts/)
})

test("classifies cancelled requests and serialized abort errors", () => {
   const fetchError = normalizeApiError({
      status: "FETCH_ERROR",
      error: "AbortError: The operation was aborted"
   })
   const serializedError = normalizeApiError({ name: "AbortError", message: "cancelled" })

   assert.equal(fetchError.kind, "aborted")
   assert.equal(fetchError.isAborted, true)
   assert.equal(fetchError.retryable, false)
   assert.equal(serializedError.kind, "aborted")
   assert.equal(serializedError.code, "REQUEST_ABORTED")
})

test("does not pass through malformed error envelopes or internal details", () => {
   const result = normalizeApiError({
      status: 500,
      stack: "Error at C:\\private\\service.ts:5",
      data: {
         success: false,
         error: { message: "Prisma raw connection secret=abc" },
         databaseUrl: "postgresql://user:secret@db/private"
      }
   })

   assert.equal(result.kind, "server")
   assert.equal(result.code, "UNKNOWN_ERROR")
   assert.equal(result.message, "Something went wrong. Please try again later.")
   assert.equal(result.status, 500)
   assert.equal(result.requestId, undefined)
   assert.doesNotMatch(JSON.stringify(result), /Prisma|private|secret|databaseUrl|stack/)
})

test("redacts sensitive messages even inside otherwise valid envelopes", () => {
   const pathMessage = normalizeApiError({
      status: 500,
      data: {
         success: false,
         error: {
            code: "INTERNAL_ERROR",
            message: "Unexpected error at C:\\private\\service.ts:5"
         }
      }
   })
   const prismaMessage = normalizeApiError({
      status: 500,
      data: {
         success: false,
         error: {
            code: "P2025",
            message: "PrismaClientKnownRequestError: record lookup failed",
         },
         requestId: "postgresql://private"
      }
   })

   assert.equal(pathMessage.message, "Something went wrong. Please try again later.")
   assert.doesNotMatch(pathMessage.message, /private|service\.ts/)
   assert.equal(prismaMessage.message, "Something went wrong. Please try again later.")
   assert.equal(prismaMessage.code, "UNKNOWN_ERROR")
   assert.equal(prismaMessage.requestId, undefined)
   assert.doesNotMatch(JSON.stringify(prismaMessage), /Prisma|P2025|postgresql|private/)
})

test("preserves an already normalized error when passed through the form helper boundary", () => {
   const initial = normalizeApiError({
      status: 404,
      data: {
         success: false,
         error: { code: "JOB_NOT_FOUND", message: "Job not found" }
      }
   })

   assert.deepEqual(normalizeApiError(initial), initial)
})
