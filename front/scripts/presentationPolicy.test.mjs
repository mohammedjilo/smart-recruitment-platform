import assert from "node:assert/strict"
import test from "node:test"
import {
   getErrorPresentation,
   getMutationPresentation,
   getPresentationMessage,
   getQueryPresentation
} from "../src/utils/presentationPolicy.ts"

const error = (overrides = {}) => ({
   kind: "server",
   code: "INTERNAL_ERROR",
   message: "Safe public message",
   retryable: false,
   isAborted: false,
   ...overrides
})

test("routes validation field errors to fields and non-field form errors inline", () => {
   assert.deepEqual(
      getErrorPresentation(
         error({
            kind: "validation",
            code: "VALIDATION_ERROR",
            fieldErrors: { email: "Invalid email" }
         }),
         { surface: "form" }
      ),
      { category: "field_error", message: "Safe public message" }
   )

   assert.equal(
      getErrorPresentation(
         error({ kind: "business", code: "JOB_NOT_OPEN" }),
         { surface: "form" }
      ).category,
      "form_error"
   )
})

test("keeps query failure distinct from empty and no-results outcomes", () => {
   assert.equal(
      getQueryPresentation(
         { status: "error", error: error() },
         "page"
      ).category,
      "page_error"
   )
   assert.equal(
      getQueryPresentation({ status: "empty", data: [] }, "page").category,
      "empty"
   )
   assert.equal(
      getQueryPresentation({ status: "no_results", data: [] }, "page").category,
      "no_results"
   )
   assert.notEqual(
      getQueryPresentation({ status: "error", error: error() }, "page").category,
      "empty"
   )
})

test("maps all query lifecycle states without hiding their semantics", () => {
   const cases = [
      [{ status: "idle" }, "none"],
      [{ status: "initial_loading" }, "loading"],
      [{ status: "success", data: [1] }, "content"],
      [{ status: "refreshing", data: [1] }, "refreshing"]
   ]

   for (const [state, expected] of cases)
      assert.equal(getQueryPresentation(state, "section").category, expected)

   assert.deepEqual(
      getQueryPresentation(
         { status: "error", error: error() },
         "section"
      ),
      {
         category: "section_error",
         message: "Safe public message",
         retry: "explicit"
      }
   )
})

test("stale query errors preserve content and aborts do not become errors", () => {
   assert.deepEqual(
      getQueryPresentation(
         {
            status: "stale_error",
            data: [{ id: "cached" }],
            error: error({ retryable: true })
         },
         "page"
      ),
      {
         category: "stale_error",
         message: "Safe public message",
         preserveContent: true,
         retry: "explicit"
      }
   )
   assert.deepEqual(
      getQueryPresentation(
         {
            status: "aborted",
            data: [{ id: "cached" }],
            error: error({ kind: "aborted", isAborted: true })
         },
         "page"
      ),
      { category: "silent", preserveContent: true }
   )
})

test("selects contextual query error destinations and explicit retry", () => {
   assert.equal(
      getQueryPresentation(
         { status: "error", error: error({ kind: "network", retryable: true }) },
         "section"
      ).retry,
      "explicit"
   )
   assert.equal(
      getQueryPresentation(
         { status: "inconsistent", reason: "error_missing" },
         "page"
      ).category,
      "page_error"
   )
})

test("routes mutation outcomes by context and preserves explicit retry", () => {
   assert.equal(
      getMutationPresentation({ status: "idle" }, { surface: "action" }).category,
      "none"
   )
   assert.equal(
      getMutationPresentation(
         { status: "submitting" },
         { surface: "form" }
      ).category,
      "loading"
   )
   assert.equal(
      getMutationPresentation(
         { status: "success" },
         { surface: "action" }
      ).category,
      "toast"
   )
   assert.equal(
      getMutationPresentation(
         { status: "success" },
         { surface: "form" }
      ).category,
      "contextual_success"
   )
   assert.deepEqual(
      getMutationPresentation(
         { status: "error", error: error({ kind: "network", retryable: true }) },
         { surface: "action" }
      ),
      {
         category: "toast",
         message: "Safe public message",
         retry: "explicit"
      }
   )
})

test("keeps business conflicts actionable without replacing their safe message", () => {
   const conflict = error({
      kind: "conflict",
      code: "DUPLICATE_APPLICATION",
      message: "You have already applied."
   })
   assert.deepEqual(
      getMutationPresentation(
         { status: "error", error: conflict },
         { surface: "action", importance: "important" }
      ),
      { category: "dialog", message: "You have already applied." }
   )
   assert.equal(
      getMutationPresentation(
         { status: "error", error: conflict },
         { surface: "action" }
      ).category,
      "toast"
   )
})

test("keeps authentication and permission failures distinct from generic errors", () => {
   assert.equal(
      getErrorPresentation(
         error({ kind: "authentication", code: "UNAUTHORIZED" }),
         { surface: "page" }
      ).category,
      "authentication_notice"
   )
   assert.equal(
      getErrorPresentation(
         error({ kind: "authorization", code: "FORBIDDEN" }),
         { surface: "page" }
      ).category,
      "access_denied"
   )
   assert.equal(
      getErrorPresentation(
         error({ kind: "authorization", code: "FORBIDDEN" }),
         { surface: "action" }
      ).category,
      "action_denied"
   )
   assert.equal(
      getErrorPresentation(
         error({ kind: "authentication", code: "UNAUTHORIZED" }),
         { surface: "action" }
      ).category,
      "authentication_notice"
   )
   assert.equal(
      getErrorPresentation(
         error({ kind: "not_found", code: "RESOURCE_NOT_FOUND" }),
         { surface: "section" }
      ).category,
      "resource_not_found"
   )
   assert.equal(
      getErrorPresentation(
         error({ kind: "not_found", code: "RESOURCE_NOT_FOUND" }),
         { surface: "action", importance: "important" }
      ).category,
      "dialog"
   )
})

test("uses normalized safe messages before contextual and generic fallbacks", () => {
   assert.equal(
      getPresentationMessage(error(), "Local fallback"),
      "Safe public message"
   )
   assert.equal(
      getPresentationMessage(error({ message: " " }), "Local fallback"),
      "Local fallback"
   )
   assert.equal(
      getPresentationMessage(error({ message: " " })),
      "Something went wrong. Please try again later."
   )
})

test("never presents intentional mutation aborts as ordinary errors", () => {
   assert.deepEqual(
      getMutationPresentation(
         {
            status: "aborted",
            error: error({
               kind: "aborted",
               code: "REQUEST_ABORTED",
               isAborted: true
            })
         },
         { surface: "action" }
      ),
      { category: "silent" }
   )
})
