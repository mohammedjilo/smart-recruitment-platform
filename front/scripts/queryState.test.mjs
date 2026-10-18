import assert from "node:assert/strict"
import test from "node:test"
import { getQueryState } from "../src/utils/queryState.ts"

const idleQuery = overrides => ({
   isUninitialized: false,
   isLoading: false,
   isFetching: false,
   isSuccess: false,
   isError: false,
   ...overrides
})

const normalizedError = overrides => ({
   kind: "server",
   code: "INTERNAL_ERROR",
   message: "Request failed safely",
   retryable: false,
   isAborted: false,
   ...overrides
})

test("maps an untouched query to idle", () => {
   assert.deepEqual(
      getQueryState(idleQuery({ isUninitialized: true })),
      { status: "idle" }
   )
})

test("maps a request without current usable data to initial loading", () => {
   assert.deepEqual(
      getQueryState(idleQuery({ isLoading: true, isFetching: true })),
      { status: "initial_loading" }
   )
})

test("maps successful array data and generic object data to success", () => {
   assert.deepEqual(
      getQueryState(idleQuery({ isSuccess: true, currentData: [{ id: "1" }] })),
      { status: "success", data: [{ id: "1" }] }
   )
   const stats = { total: 4, active: 2 }
   assert.deepEqual(
      getQueryState(idleQuery({ isSuccess: true, currentData: stats })),
      { status: "success", data: stats }
   )
})

test("keeps successful zero-valued statistics as success", () => {
   const stats = { total: 0, active: 0, closed: 0 }

   assert.deepEqual(
      getQueryState(idleQuery({ isSuccess: true, currentData: stats })),
      { status: "success", data: stats }
   )
})

test("keeps independent query outcomes independent", () => {
   const stats = { total: 0 }
   const statsState = getQueryState(
      idleQuery({ isSuccess: true, currentData: stats })
   )
   const recordsState = getQueryState(
      idleQuery({ isError: true, error: normalizedError() })
   )

   assert.deepEqual(statsState, { status: "success", data: stats })
   assert.equal(recordsState.status, "error")
})

test("maps a successful empty collection separately from errors", () => {
   assert.deepEqual(
      getQueryState(idleQuery({ isSuccess: true, currentData: [] })),
      { status: "empty", data: [] }
   )
   assert.deepEqual(
      getQueryState(
         idleQuery({ isSuccess: true, currentData: [] }),
         { isEmpty: value => Array.isArray(value) ? value.length === 0 : value.total === 0 }
      ),
      { status: "empty", data: [] }
   )
   assert.deepEqual(
      getQueryState(
         idleQuery({ isSuccess: true, currentData: { total: 0 } }),
         { isEmpty: value => value.total === 0 }
      ),
      { status: "empty", data: { total: 0 } }
   )
})

test("uses no_results only when the caller supplies explicit evidence", () => {
   const query = idleQuery({ isSuccess: true, currentData: [] })
   assert.equal(getQueryState(query).status, "empty")
   assert.deepEqual(getQueryState(query, { noResults: true }), {
      status: "no_results",
      data: []
   })
   assert.deepEqual(
      getQueryState(
         idleQuery({ isSuccess: true, currentData: [{ id: "1" }] }),
         { noResults: true }
      ),
      { status: "success", data: [{ id: "1" }] }
   )
})

test("maps successful existing current data plus an active fetch to refreshing", () => {
   assert.deepEqual(
      getQueryState(
         idleQuery({
            isSuccess: true,
            isFetching: true,
            currentData: [{ id: "1" }]
         })
      ),
      { status: "refreshing", data: [{ id: "1" }] }
   )
})

test("does not expose data for previous args as data for current args", () => {
   const state = getQueryState(
      idleQuery({
         isLoading: true,
         isFetching: true,
         data: [{ id: "from-old-filter" }],
         currentData: undefined
      })
   )

   assert.deepEqual(state, { status: "initial_loading" })

   const failed = getQueryState(
      idleQuery({
         isError: true,
         error: normalizedError(),
         data: [{ id: "from-old-filter" }],
         currentData: undefined
      })
   )
   assert.equal(failed.status, "error")
})

test("maps initial request failure to error with normalized error", () => {
   const rawError = {
      status: 503,
      data: {
         success: false,
         error: { code: "SERVICE_UNAVAILABLE", message: "Try again later" },
         requestId: "req-55"
      }
   }
   const state = getQueryState(idleQuery({ isError: true, error: rawError }))

   assert.equal(state.status, "error")
   assert.deepEqual(state.error, {
      kind: "service_unavailable",
      code: "SERVICE_UNAVAILABLE",
      message: "Try again later",
      status: 503,
      requestId: "req-55",
      retryable: true,
      isAborted: false
   })
})

test("preserves current data and exposes a refetch failure as stale_error", () => {
   const data = [{ id: "cached" }]
   const state = getQueryState(
      idleQuery({
         isError: true,
         data,
         currentData: data,
         error: normalizedError()
      })
   )

   assert.deepEqual(state, {
      status: "stale_error",
      data,
      error: normalizedError()
   })
})

test("an aborted query stays distinct and retains usable data if present", () => {
   const error = normalizedError({
      kind: "aborted",
      code: "REQUEST_ABORTED",
      message: "The request was cancelled.",
      isAborted: true
   })
   const state = getQueryState(idleQuery({ isError: true, error }))
   assert.deepEqual(state, { status: "aborted", error })

   const data = { id: "cached" }
   assert.deepEqual(
      getQueryState(idleQuery({ isError: true, error, currentData: data })),
      { status: "aborted", error, data }
   )
})

test("reports malformed lifecycle combinations deterministically", () => {
   assert.deepEqual(
      getQueryState(
         idleQuery({ isUninitialized: true, isFetching: true, currentData: [1] })
      ),
      { status: "inconsistent", reason: "uninitialized_with_other_state" }
   )
   assert.deepEqual(
      getQueryState(idleQuery({ isError: true })),
      { status: "inconsistent", reason: "error_missing" }
   )
   assert.deepEqual(
      getQueryState(idleQuery({ isSuccess: true, currentData: undefined })),
      { status: "inconsistent", reason: "success_without_current_data" }
   )
   assert.deepEqual(
      getQueryState(idleQuery({ currentData: [1] })),
      { status: "inconsistent", reason: "data_without_terminal_or_active_state" }
   )
   assert.deepEqual(getQueryState(idleQuery()), {
      status: "inconsistent",
      reason: "active_request_without_loading_or_fetching"
   })
})
