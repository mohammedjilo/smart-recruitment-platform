import assert from "node:assert/strict"
import test from "node:test"
import {
   getMutationErrorState,
   getMutationState
} from "../src/utils/mutationState.ts"

const idleMutation = overrides => ({
   isUninitialized: false,
   isLoading: false,
   isSuccess: false,
   isError: false,
   ...overrides
})

test("maps an untouched mutation to idle", () => {
   assert.deepEqual(
      getMutationState(idleMutation({ isUninitialized: true })),
      { status: "idle" }
   )
})

test("maps a running mutation to submitting", () => {
   assert.deepEqual(
      getMutationState(idleMutation({ isLoading: true })),
      { status: "submitting" }
   )
})

test("maps mutation success and preserves response data", () => {
   const data = { id: "created-1" }
   assert.deepEqual(
      getMutationState(idleMutation({ isSuccess: true, data })),
      { status: "success", data }
   )
})

test("allows successful void mutations without response data", () => {
   assert.deepEqual(
      getMutationState(idleMutation({ isSuccess: true })),
      { status: "success" }
   )
})

test("normalizes validation errors and preserves safe field errors and code", () => {
   const state = getMutationState(
      idleMutation({
         isError: true,
         error: {
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
         }
      })
   )

   assert.equal(state.status, "error")
   assert.equal(state.error.kind, "validation")
   assert.equal(state.error.code, "VALIDATION_ERROR")
   assert.deepEqual(state.error.fieldErrors, { email: "Invalid email" })
   assert.equal(state.error.requestId, "req-123")
})

test("preserves domain semantics and original backend codes", () => {
   const conflict = getMutationState(
      idleMutation({
         isError: true,
         error: {
            status: 409,
            data: {
               success: false,
               error: { code: "DUPLICATE_APPLICATION", message: "Already applied" }
            }
         }
      })
   )

   assert.equal(conflict.status, "error")
   assert.equal(conflict.error.kind, "conflict")
   assert.equal(conflict.error.code, "DUPLICATE_APPLICATION")
})

test("uses the existing API error taxonomy for mutation outcomes", () => {
   const cases = [
      ["UNAUTHORIZED", 401, "authentication"],
      ["FORBIDDEN", 403, "authorization"],
      ["RESOURCE_NOT_FOUND", 404, "not_found"],
      ["DUPLICATE_RESOURCE", 409, "conflict"],
      ["JOB_NOT_OPEN", 400, "business"],
      ["INVALID_UPLOAD", 400, "upload"],
      ["TIMEOUT", 504, "timeout"],
      ["SERVICE_UNAVAILABLE", 503, "service_unavailable"],
      ["INTERNAL_ERROR", 500, "server"]
   ]

   for (const [code, status, expectedKind] of cases) {
      const state = getMutationState(
         idleMutation({
            isError: true,
            error: {
               status,
               data: {
                  success: false,
                  error: { code, message: "Safe public message" }
               }
            }
         })
      )

      assert.equal(state.status, "error", code)
      assert.equal(state.error.kind, expectedKind, code)
      assert.equal(state.error.code, code, code)
   }
})

test("maps cancellation to a distinct aborted outcome", () => {
   assert.deepEqual(
      getMutationState(
         idleMutation({
            isError: true,
            error: { name: "AbortError", message: "cancelled" }
         })
      ),
      {
         status: "aborted",
         error: {
            kind: "aborted",
            code: "REQUEST_ABORTED",
            message: "The request was cancelled.",
            retryable: false,
            isAborted: true
         }
      }
   )
})

test("classifies caught mutation errors through the shared mutation state", () => {
   assert.deepEqual(
      getMutationErrorState({
         status: 409,
         data: {
            success: false,
            error: {
               code: "DUPLICATE_APPLICATION",
               message: "Already applied"
            }
         }
      }).error,
      {
         kind: "conflict",
         code: "DUPLICATE_APPLICATION",
         message: "Already applied",
         status: 409,
         retryable: false,
         isAborted: false
      }
   )

   assert.equal(
      getMutationErrorState({ name: "AbortError" }).status,
      "aborted"
   )
})

test("normalizes non-contract mutation failures instead of exposing raw errors", () => {
   const state = getMutationState(
      idleMutation({
         isError: true,
         error: { status: "FETCH_ERROR", error: "private transport details" }
      })
   )

   assert.equal(state.status, "error")
   assert.equal(state.error.kind, "network")
   assert.equal(state.error.message, "Unable to connect to the server. Please try again.")
   assert.doesNotMatch(JSON.stringify(state), /private transport details/)
})

test("classifies unknown mutation failures using the shared normalizer", () => {
   const state = getMutationState(
      idleMutation({
         isError: true,
         error: { status: 200, data: { unexpected: "shape" } }
      })
   )

   assert.equal(state.status, "error")
   assert.equal(state.error.kind, "unknown")
   assert.equal(state.error.code, "UNKNOWN_ERROR")
})

test("reports malformed mutation lifecycle combinations", () => {
   assert.deepEqual(
      getMutationState(
         idleMutation({ isUninitialized: true, isLoading: true })
      ),
      { status: "inconsistent", reason: "uninitialized_with_other_state" }
   )
   assert.deepEqual(
      getMutationState(idleMutation({ isLoading: true, isError: true })),
      { status: "inconsistent", reason: "loading_with_terminal_state" }
   )
   assert.deepEqual(
      getMutationState(idleMutation({ isSuccess: true, isError: true })),
      { status: "inconsistent", reason: "success_and_error" }
   )
   assert.deepEqual(
      getMutationState(
         idleMutation({
            isSuccess: true,
            error: { status: "FETCH_ERROR", error: "unexpected" }
         })
      ),
      { status: "inconsistent", reason: "success_with_error" }
   )
   assert.deepEqual(
      getMutationState(idleMutation({ isError: true })),
      { status: "inconsistent", reason: "error_missing" }
   )
   assert.deepEqual(getMutationState(idleMutation()), {
      status: "inconsistent",
      reason: "no_lifecycle_state"
   })
})
