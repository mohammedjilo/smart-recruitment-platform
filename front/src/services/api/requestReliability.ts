import type {
   BaseQueryApi,
   BaseQueryFn,
   FetchArgs,
   FetchBaseQueryError,
   FetchBaseQueryMeta,
   QueryReturnValue
} from "@reduxjs/toolkit/query"

export type ApiRequestArgs = string | FetchArgs
export type ApiRequestResult = QueryReturnValue<
   unknown,
   FetchBaseQueryError,
   FetchBaseQueryMeta
>
export type ApiRequestExecutor = (
   args: ApiRequestArgs,
   api: BaseQueryApi,
   extraOptions: {}
) => ApiRequestResult | PromiseLike<ApiRequestResult>

export type RefreshOutcome =
   | { kind: "success"; token: string }
   | { kind: "authentication_failure" }
   | { kind: "account_deactivated"; error: FetchBaseQueryError }
   | { kind: "request_failure"; error: FetchBaseQueryError }

interface RequestReliabilityOptions {
   execute: ApiRequestExecutor
   refresh: (api: BaseQueryApi, extraOptions: {}) => Promise<RefreshOutcome>
   shouldRefresh?: (args: ApiRequestArgs, api: BaseQueryApi) => boolean
   getToken: (api: BaseQueryApi) => string | null
   setToken: (api: BaseQueryApi, token: string) => void | Promise<void>
   invalidateSession: (api: BaseQueryApi) => void
   retryDelayMs?: number
   wait?: (milliseconds: number, signal: AbortSignal) => Promise<boolean>
}

const RETRYABLE_HTTP_STATUSES = new Set([502, 503, 504])
const DEFAULT_RETRY_DELAY_MS = 300

const isUnauthorized = (result: ApiRequestResult) =>
   "error" in result && result.error !== undefined && result.error.status === 401

const isTransientFailure = (error: FetchBaseQueryError) =>
   error.status === "FETCH_ERROR" ||
   error.status === "TIMEOUT_ERROR" ||
   (typeof error.status === "number" && RETRYABLE_HTTP_STATUSES.has(error.status))

const abortResult: ApiRequestResult = {
   error: {
      status: "FETCH_ERROR",
      error: "AbortError: The request was aborted."
   }
}

export const waitForRetry = (milliseconds: number, signal: AbortSignal) =>
   new Promise<boolean>(resolve => {
      if (signal.aborted) {
         resolve(false)
         return
      }

      let settled = false
      const finish = (shouldContinue: boolean) => {
         if (settled) return
         settled = true
         clearTimeout(timer)
         signal.removeEventListener("abort", onAbort)
         resolve(shouldContinue)
      }
      const onAbort = () => finish(false)
      const timer = setTimeout(() => finish(true), milliseconds)
      signal.addEventListener("abort", onAbort, { once: true })
   })

const waitForRefresh = (
   refreshPromise: Promise<RefreshOutcome>,
   signal: AbortSignal
): Promise<RefreshOutcome | null> =>
   new Promise(resolve => {
      if (signal.aborted) {
         resolve(null)
         return
      }

      let settled = false
      const finish = (outcome: RefreshOutcome | null) => {
         if (settled) return
         settled = true
         signal.removeEventListener("abort", onAbort)
         resolve(outcome)
      }
      const onAbort = () => finish(null)
      signal.addEventListener("abort", onAbort, { once: true })
      refreshPromise.then(finish, () => finish({
         kind: "request_failure",
         error: {
            status: "CUSTOM_ERROR",
            error: "The refresh request failed unexpectedly."
         }
      }))
   })

const invalidRefreshResponse: FetchBaseQueryError = {
   status: 503,
   data: {
      success: false,
      error: {
         code: "SERVICE_UNAVAILABLE",
         message: "The server returned an invalid refresh response."
      }
   }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
   typeof value === "object" && value !== null

const isAccountDeactivatedError = (error: FetchBaseQueryError) =>
   isRecord(error.data) &&
   isRecord(error.data.error) &&
   error.data.error.code === "ACCOUNT_DEACTIVATED"

export const interpretRefreshResult = (result: ApiRequestResult): RefreshOutcome => {
   if ("error" in result && result.error !== undefined) {
      if (isAccountDeactivatedError(result.error)) {
         return { kind: "account_deactivated", error: result.error }
      }
      if (
         result.error.status === 401 ||
         result.error.status === 403 ||
         (isRecord(result.error.data) &&
            isRecord(result.error.data.error) &&
            result.error.data.error.code === "UNAUTHORIZED")
      ) {
         return { kind: "authentication_failure" }
      }
      return { kind: "request_failure", error: result.error }
   }

   const response = result.data
   if (
      isRecord(response) &&
      response.success === true &&
      isRecord(response.data) &&
      typeof response.data.token === "string" &&
      response.data.token.length > 0
   ) {
      return { kind: "success", token: response.data.token }
   }

   if (
      isRecord(response) &&
      response.success === false &&
      isRecord(response.error) &&
      response.error.code === "UNAUTHORIZED"
   ) {
      return { kind: "authentication_failure" }
   }

   return { kind: "request_failure", error: invalidRefreshResponse }
}

export const createReliableBaseQuery = ({
   execute,
   refresh,
   shouldRefresh = () => true,
   getToken,
   setToken,
   invalidateSession,
   retryDelayMs = DEFAULT_RETRY_DELAY_MS,
   wait = waitForRetry
}: RequestReliabilityOptions): BaseQueryFn<
   ApiRequestArgs,
   unknown,
   FetchBaseQueryError
> => {
   let sharedRefresh: Promise<RefreshOutcome> | null = null

   const startOrJoinRefresh = (
      api: BaseQueryApi,
      extraOptions: {}
   ): Promise<RefreshOutcome> => {
      if (sharedRefresh) return sharedRefresh

      const operation = Promise.resolve()
         .then(() => refresh(api, extraOptions))
         .then(async outcome => {
            if (outcome.kind === "success") {
               await setToken(api, outcome.token)
            } else if (outcome.kind === "authentication_failure") {
               invalidateSession(api)
            }
            return outcome
         })
         .catch((): RefreshOutcome => ({
            kind: "request_failure",
            error: {
               status: "CUSTOM_ERROR",
               error: "The refresh request failed unexpectedly."
            }
         }))

      let currentPromise: Promise<RefreshOutcome>
      currentPromise = operation.finally(() => {
         if (sharedRefresh === currentPromise) sharedRefresh = null
      })
      sharedRefresh = currentPromise
      return currentPromise
   }

   const executeWithQueryRetry = async (
      args: ApiRequestArgs,
      api: BaseQueryApi,
      extraOptions: {}
   ): Promise<ApiRequestResult> => {
      const maxAttempts = api.type === "query" ? 2 : 1

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
         if (api.signal.aborted) return abortResult

         const result = await execute(args, api, extraOptions)
         if (api.signal.aborted) return abortResult
         if (
            !("error" in result) ||
            result.error === undefined ||
            !isTransientFailure(result.error) ||
            attempt === maxAttempts
         ) {
            return result
         }

         const shouldContinue = await wait(retryDelayMs, api.signal)
         if (!shouldContinue || api.signal.aborted) return abortResult
      }

      return abortResult
   }

   return async (args, api, extraOptions) => {
      const tokenAtStart = getToken(api)
      const initialResult = await executeWithQueryRetry(args, api, extraOptions)
      if (!isUnauthorized(initialResult)) return initialResult
      if (!shouldRefresh(args, api)) return initialResult

      const latestToken = getToken(api)
      if (latestToken && latestToken !== tokenAtStart) {
         return executeWithQueryRetry(args, api, extraOptions)
      }

      const refreshOutcome = await waitForRefresh(
         startOrJoinRefresh(api, extraOptions),
         api.signal
      )
      if (!refreshOutcome) return abortResult

      if (refreshOutcome.kind === "authentication_failure") return initialResult
      if (refreshOutcome.kind === "account_deactivated")
         return { error: refreshOutcome.error }
      if (refreshOutcome.kind === "request_failure")
         return { error: refreshOutcome.error }

      return executeWithQueryRetry(args, api, extraOptions)
   }
}
