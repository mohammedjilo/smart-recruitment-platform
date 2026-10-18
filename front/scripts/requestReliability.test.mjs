import assert from "node:assert/strict"
import test from "node:test"
import { fetchBaseQuery } from "@reduxjs/toolkit/query"
import {
   createReliableBaseQuery,
   interpretRefreshResult,
   waitForRetry
} from "../src/services/api/requestReliability.ts"
import { normalizeApiError } from "../src/utils/apiError.ts"

const apiFor = ({ type = "query", signal = new AbortController().signal, getState } = {}) => ({
   type,
   signal,
   endpoint: "testEndpoint",
   forced: false,
   queryCacheKey: "test-query",
   abort() {},
   dispatch() {},
   getState: getState ?? (() => ({ auth: { token: "token-a" } }))
})

const errorResult = status => ({ error: { status, error: String(status) } })
const successfulResult = data => ({ data: { value: data } })
const immediateWait = async (_milliseconds, signal) => !signal.aborted

const reliableQuery = options =>
   createReliableBaseQuery({
      execute: options.execute,
      refresh: options.refresh ?? (async () => ({ kind: "success", token: "token-b" })),
      getToken: options.getToken ?? (() => "token-a"),
      setToken: options.setToken ?? (() => {}),
      invalidateSession: options.invalidateSession ?? (() => {}),
      retryDelayMs: options.retryDelayMs ?? 0,
      wait: options.wait ?? immediateWait
   })

test("401 refreshes once, stores the new token, and retries the original request", async () => {
   let calls = 0
   let refreshCalls = 0
   let token = "token-a"
   const query = reliableQuery({
      execute: async (_args, api) => {
         calls += 1
         if (api.getState().auth.token === "token-a") return errorResult(401)
         return successfulResult("retried")
      },
      refresh: async () => {
         refreshCalls += 1
         return { kind: "success", token: "token-b" }
      },
      getToken: () => token,
      setToken: (_api, nextToken) => {
         token = nextToken
      }
   })

   const result = await query("/resource", apiFor({
      getState: () => ({ auth: { token } })
   }), {})

   assert.deepEqual(result, successfulResult("retried"))
   assert.equal(token, "token-b")
   assert.equal(calls, 2)
   assert.equal(refreshCalls, 1)
})

test("the refreshed Redux token is persisted for subsequent browser sessions", async () => {
   const storage = new Map()
   const originalLocalStorage = globalThis.localStorage
   globalThis.localStorage = {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key)
   }

   try {
      const { authActions, authReducer } = await import("../src/redux/slices/authSlice.ts")
      const refreshedState = authReducer(undefined, authActions.setToken("token-b"))
      assert.equal(refreshedState.token, "token-b")
      assert.equal(storage.get("token"), "token-b")

      const loggedOutState = authReducer(refreshedState, authActions.setToken(null))
      assert.equal(loggedOutState.token, null)
      assert.equal(storage.has("token"), false)
   } finally {
      if (originalLocalStorage === undefined) delete globalThis.localStorage
      else globalThis.localStorage = originalLocalStorage
   }
})

test("a second 401 after successful refresh does not start another refresh", async () => {
   let calls = 0
   let refreshCalls = 0
   const query = reliableQuery({
      execute: async () => {
         calls += 1
         return errorResult(401)
      },
      refresh: async () => {
         refreshCalls += 1
         return { kind: "success", token: "token-b" }
      }
   })

   const result = await query("/resource", apiFor(), {})

   assert.deepEqual(result, errorResult(401))
   assert.equal(calls, 2)
   assert.equal(refreshCalls, 1)
})

test("concurrent 401s share one refresh and retry every request", async () => {
   let releaseInitialRequests
   const initialRequestsReady = new Promise(resolve => {
      releaseInitialRequests = resolve
   })
   let initialRequestCount = 0
   let refreshCalls = 0
   let token = "token-a"
   const query = reliableQuery({
      execute: async (args, api) => {
         const path = args
         const currentToken = api.getState().auth.token
         if (currentToken === "token-a") {
            initialRequestCount += 1
            if (initialRequestCount === 3) releaseInitialRequests()
            await initialRequestsReady
            return errorResult(401)
         }
         return successfulResult(path)
      },
      refresh: async () => {
         refreshCalls += 1
         await new Promise(resolve => setTimeout(resolve, 10))
         return { kind: "success", token: "token-b" }
      },
      getToken: () => token,
      setToken: (_api, nextToken) => {
         token = nextToken
      }
   })
   const api = () => apiFor({ getState: () => ({ auth: { token } }) })

   const results = await Promise.all(
      ["/a", "/b", "/c"].map(path => query(path, api(), {}))
   )

   assert.deepEqual(results, [
      successfulResult("/a"),
      successfulResult("/b"),
      successfulResult("/c")
   ])
   assert.equal(refreshCalls, 1)
   assert.equal(initialRequestCount, 3)
})

test("concurrent refresh transport failure preserves session and is normalized", async () => {
   let releaseInitialRequests
   const initialRequestsReady = new Promise(resolve => {
      releaseInitialRequests = resolve
   })
   let requestCount = 0
   let refreshCalls = 0
   let invalidations = 0
   const query = reliableQuery({
      execute: async () => {
         requestCount += 1
         if (requestCount === 3) releaseInitialRequests()
         await initialRequestsReady
         return errorResult(401)
      },
      refresh: async () => {
         refreshCalls += 1
         await new Promise(resolve => setTimeout(resolve, 10))
         return {
            kind: "request_failure",
            error: { status: "FETCH_ERROR", error: "temporary network failure" }
         }
      },
      invalidateSession: () => {
         invalidations += 1
      }
   })

   const results = await Promise.all(
      ["/a", "/b", "/c"].map(path => query(path, apiFor(), {}))
   )

   assert.equal(refreshCalls, 1)
   assert.equal(invalidations, 0)
   for (const result of results) {
      assert.equal(result.error.status, "FETCH_ERROR")
      assert.equal(normalizeApiError(result.error).kind, "network")
   }
})

test("definitive refresh authentication failure invalidates the session once", async () => {
   let invalidations = 0
   const query = reliableQuery({
      execute: async () => errorResult(401),
      refresh: async () => ({ kind: "authentication_failure" }),
      invalidateSession: () => {
         invalidations += 1
      }
   })

   const result = await query("/resource", apiFor(), {})

   assert.deepEqual(result, errorResult(401))
   assert.equal(invalidations, 1)
})

test("refresh timeout preserves the session and remains a normalized timeout", async () => {
   let invalidations = 0
   const query = reliableQuery({
      execute: async () => errorResult(401),
      refresh: async () => ({
         kind: "request_failure",
         error: { status: "TIMEOUT_ERROR", error: "Timed out" }
      }),
      invalidateSession: () => {
         invalidations += 1
      }
   })

   const result = await query("/resource", apiFor(), {})

   assert.equal(invalidations, 0)
   assert.equal(normalizeApiError(result.error).kind, "timeout")
})

test("malformed refresh response is a service failure, not an authentication failure", () => {
   const outcome = interpretRefreshResult({ data: { success: true, data: {} } })
   assert.deepEqual(outcome, {
      kind: "request_failure",
      error: {
         status: 503,
         data: {
            success: false,
            error: {
               code: "SERVICE_UNAVAILABLE",
               message: "The server returned an invalid refresh response."
            }
         }
      }
   })

   assert.equal(normalizeApiError(outcome.error).kind, "service_unavailable")
   assert.deepEqual(
      interpretRefreshResult({ data: { success: true, data: { token: "new-token" } } }),
      { kind: "success", token: "new-token" }
   )
   assert.deepEqual(interpretRefreshResult(errorResult(403)), {
      kind: "authentication_failure"
   })
   const deactivatedRefresh = interpretRefreshResult({
      error: {
         status: 403,
         data: {
            success: false,
            error: {
               code: "ACCOUNT_DEACTIVATED",
               message: "Your account has been deactivated."
            }
         }
      }
   })
   assert.equal(deactivatedRefresh.kind, "account_deactivated")
   assert.equal(deactivatedRefresh.error.status, 403)
   assert.deepEqual(
      interpretRefreshResult({
         data: {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Refresh token expired" }
         }
      }),
      { kind: "authentication_failure" }
   )
})

test("deactivated refresh response is propagated instead of being treated as expiry", async () => {
   const deactivatedError = {
      status: 403,
      data: {
         success: false,
         error: {
            code: "ACCOUNT_DEACTIVATED",
            message: "Your account has been deactivated."
         }
      }
   }
   const query = reliableQuery({
      execute: async () => errorResult(401),
      refresh: async () => interpretRefreshResult({ error: deactivatedError })
   })

   const result = await query("/protected", apiFor(), {})
   assert.deepEqual(result.error, deactivatedError)
})

test("a stale-token 401 retries using the updated token without another refresh", async () => {
   let token = "token-a"
   let calls = 0
   let refreshCalls = 0
   const query = reliableQuery({
      execute: async (_args, api) => {
         calls += 1
         if (calls === 1) {
            token = "token-b"
            return errorResult(401)
         }
         assert.equal(api.getState().auth.token, "token-b")
         return successfulResult("new-token-used")
      },
      getToken: () => token,
      refresh: async () => {
         refreshCalls += 1
         return { kind: "success", token: "unexpected" }
      }
   })

   const result = await query("/resource", apiFor({
      getState: () => ({ auth: { token } })
   }), {})

   assert.deepEqual(result, successfulResult("new-token-used"))
   assert.equal(calls, 2)
   assert.equal(refreshCalls, 0)
})

test("queries retry transient failures once, with a bounded backoff", async () => {
   for (const transientStatus of [
      "FETCH_ERROR",
      "TIMEOUT_ERROR",
      502,
      503,
      504
   ]) {
      let attempts = 0
      const waits = []
      const query = reliableQuery({
         retryDelayMs: 300,
         execute: async () => {
            attempts += 1
            return attempts === 1 ? errorResult(transientStatus) : successfulResult("ok")
         },
         wait: async (milliseconds, signal) => {
            waits.push(milliseconds)
            return !signal.aborted
         }
      })

      const result = await query("/query", apiFor(), {})
      assert.deepEqual(result, successfulResult("ok"), String(transientStatus))
      assert.equal(attempts, 2, String(transientStatus))
      assert.deepEqual(waits, [300], String(transientStatus))
   }
})

test("final transient failures are normalized after the retry limit", async () => {
   for (const status of ["FETCH_ERROR", "TIMEOUT_ERROR", 503, 504]) {
      let attempts = 0
      const query = reliableQuery({
         execute: async () => {
            attempts += 1
            return errorResult(status)
         }
      })

      const result = await query("/query", apiFor(), {})
      assert.equal(attempts, 2, String(status))
      const normalized = normalizeApiError(result.error)
      const expectedKind =
         status === "FETCH_ERROR"
            ? "network"
            : status === 503
              ? "service_unavailable"
              : "timeout"
      assert.equal(normalized.kind, expectedKind)
   }
})

test("client, auth, forbidden, not-found, conflict, and domain errors are not retried", async () => {
   for (const status of [400, 401, 403, 404, 409]) {
      let attempts = 0
      let refreshCalls = 0
      const query = reliableQuery({
         execute: async () => {
            attempts += 1
            return errorResult(status)
         },
         refresh: async () => {
            refreshCalls += 1
            return { kind: "authentication_failure" }
         }
      })

      await query("/query", apiFor(), {})
      assert.equal(attempts, 1)
      assert.equal(refreshCalls, status === 401 ? 1 : 0)
   }

   let domainAttempts = 0
   const domainQuery = reliableQuery({
      execute: async () => {
         domainAttempts += 1
         return {
            error: {
               status: 400,
               data: {
                  success: false,
                  error: { code: "JOB_NOT_OPEN", message: "Job is closed" }
               }
            }
         }
      }
   })
   await domainQuery("/query", apiFor(), {})
   assert.equal(domainAttempts, 1)
})

test("mutations never receive automatic retries for transient errors", async () => {
   let attempts = 0
   const query = reliableQuery({
      execute: async () => {
         attempts += 1
         return errorResult("FETCH_ERROR")
      }
   })

   const result = await query("/mutation", apiFor({ type: "mutation" }), {})
   assert.equal(result.error.status, "FETCH_ERROR")
   assert.equal(attempts, 1)
})

test("a mutation rejected with 401 is retried only after successful refresh", async () => {
   let token = "token-a"
   let attempts = 0
   let refreshCalls = 0
   const query = reliableQuery({
      execute: async (_args, api) => {
         attempts += 1
         return api.getState().auth.token === "token-a"
            ? errorResult(401)
            : successfulResult("authenticated mutation")
      },
      refresh: async () => {
         refreshCalls += 1
         return { kind: "success", token: "token-b" }
      },
      getToken: () => token,
      setToken: (_api, nextToken) => {
         token = nextToken
      }
   })

   const result = await query("/mutation", apiFor({
      type: "mutation",
      getState: () => ({ auth: { token } })
   }), {})

   assert.deepEqual(result, successfulResult("authenticated mutation"))
   assert.equal(attempts, 2)
   assert.equal(refreshCalls, 1)
})

test("abort during retry backoff cancels the retry and cleans up the timer", async () => {
   const originalSetTimeout = globalThis.setTimeout
   const originalClearTimeout = globalThis.clearTimeout
   let scheduled = 0
   let cleared = 0
   globalThis.setTimeout = (...args) => {
      scheduled += 1
      return originalSetTimeout(...args)
   }
   globalThis.clearTimeout = timer => {
      cleared += 1
      return originalClearTimeout(timer)
   }

   try {
      const controller = new AbortController()
      let attempts = 0
      const query = createReliableBaseQuery({
         execute: async () => {
            attempts += 1
            return errorResult("FETCH_ERROR")
         },
         refresh: async () => ({ kind: "authentication_failure" }),
         getToken: () => "token-a",
         setToken: () => {},
         invalidateSession: () => {}
      })

      const pending = query("/query", apiFor({ signal: controller.signal }), {})
      await new Promise(resolve => originalSetTimeout(resolve, 5))
      controller.abort()
      const result = await pending

      assert.equal(result.error.status, "FETCH_ERROR")
      assert.match(result.error.error, /AbortError/)
      assert.equal(normalizeApiError(result.error).kind, "aborted")
      assert.equal(attempts, 1)
      assert.equal(scheduled, 1)
      assert.equal(cleared, 1)
   } finally {
      globalThis.setTimeout = originalSetTimeout
      globalThis.clearTimeout = originalClearTimeout
   }
})

test("aborting while waiting for a shared refresh cancels only that request", async () => {
   let finishRefresh
   const refreshWait = new Promise(resolve => {
      finishRefresh = resolve
   })
   let token = "token-a"
   const query = reliableQuery({
      execute: async (_args, api) =>
         api.getState().auth.token === "token-a"
            ? errorResult(401)
            : successfulResult("ok"),
      refresh: async () => {
         await refreshWait
         return { kind: "success", token: "token-b" }
      },
      getToken: () => token,
      setToken: (_api, nextToken) => {
         token = nextToken
      }
   })
   const controller = new AbortController()
   const pending = query("/query", apiFor({
      signal: controller.signal,
      getState: () => ({ auth: { token } })
   }), {})

   await new Promise(resolve => setTimeout(resolve, 0))
   controller.abort()
   const result = await pending
   finishRefresh()

   assert.equal(normalizeApiError(result.error).kind, "aborted")
   assert.equal(token, "token-a")
})

test("an aborted in-flight request receives RTK Query's signal and is not retried", async () => {
   const controller = new AbortController()
   let receivedSignal
   let attempts = 0
   const query = reliableQuery({
      execute: async (_args, api) => {
         attempts += 1
         receivedSignal = api.signal
         return new Promise(resolve => {
            api.signal.addEventListener("abort", () => {
               resolve(errorResult("FETCH_ERROR"))
            }, { once: true })
         })
      }
   })

   const pending = query("/query", apiFor({ signal: controller.signal }), {})
   controller.abort()
   const result = await pending

   assert.equal(receivedSignal, controller.signal)
   assert.equal(attempts, 1)
   assert.equal(normalizeApiError(result.error).kind, "aborted")
})

test("fetchBaseQuery timeout aborts the request and remains distinguishable", async () => {
   let receivedSignal
   const query = fetchBaseQuery({
      baseUrl: "https://api.invalid",
      timeout: 10,
      fetchFn: request =>
         new Promise((_resolve, reject) => {
            receivedSignal = request.signal
            request.signal.addEventListener("abort", () => {
               const error =
                  request.signal.reason instanceof Error
                     ? request.signal.reason
                     : new Error("aborted")
               if (!request.signal.reason) error.name = "AbortError"
               queueMicrotask(() => reject(error))
            }, { once: true })
         })
   })

   const result = await query("/slow", apiFor(), {})

   assert.equal(result.error.status, "TIMEOUT_ERROR")
   assert.equal(receivedSignal.aborted, true)
   assert.equal(normalizeApiError(result.error).kind, "timeout")
})

test("retry wait resolves false on abort and removes its abort listener", async () => {
   const controller = new AbortController()
   const originalRemoveEventListener = controller.signal.removeEventListener.bind(
      controller.signal
   )
   let removed = 0
   controller.signal.removeEventListener = (type, listener, options) => {
      if (type === "abort") removed += 1
      return originalRemoveEventListener(type, listener, options)
   }

   const pending = waitForRetry(10_000, controller.signal)
   controller.abort()

   assert.equal(await pending, false)
   assert.equal(removed, 1)
})

test("fetchBaseQuery includes credentials in API requests", async () => {
   let receivedRequest
   const query = fetchBaseQuery({
      baseUrl: "https://api.invalid",
      credentials: "include",
      fetchFn: async request => {
         receivedRequest = request
         return new Response('"ok"', {
            headers: { "content-type": "application/json" }
         })
      }
   })

   const result = await query("/resource", apiFor(), {})
   assert.equal(result.data, "ok")
   assert.equal(receivedRequest.credentials, "include")
})
