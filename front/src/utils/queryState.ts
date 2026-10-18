import {
   normalizeApiError,
   type NormalizedApiError
} from "./apiError.ts"

export type SemanticQueryState<TData> =
   | { status: "idle" }
   | { status: "initial_loading" }
   | { status: "success"; data: TData }
   | { status: "empty"; data: TData }
   | { status: "no_results"; data: TData }
   | { status: "refreshing"; data: TData }
   | { status: "error"; error: NormalizedApiError }
   | { status: "stale_error"; data: TData; error: NormalizedApiError }
   | { status: "aborted"; error: NormalizedApiError; data?: TData }
   | {
        status: "inconsistent"
        reason:
           | "uninitialized_with_other_state"
           | "error_missing"
           | "success_without_current_data"
           | "data_without_terminal_or_active_state"
           | "active_request_without_loading_or_fetching"
     }

export interface RawQueryState<TData> {
   isUninitialized: boolean
   isLoading: boolean
   isFetching: boolean
   isSuccess: boolean
   isError: boolean
   data?: TData
   currentData?: TData
   error?: unknown
}

export interface QueryStateOptions<TData> {
   isEmpty?: (data: TData) => boolean
   noResults?: boolean
}

const hasOwn = <T extends object>(value: T, key: PropertyKey) =>
   Object.prototype.hasOwnProperty.call(value, key)

const isEmptyCollection = (data: unknown) =>
   Array.isArray(data) && data.length === 0

const inconsistent = (
   reason: Extract<
      SemanticQueryState<never>,
      { status: "inconsistent" }
   >["reason"]
): SemanticQueryState<never> => ({ status: "inconsistent", reason })

export const getQueryState = <TData>(
   query: RawQueryState<TData>,
   options: QueryStateOptions<TData> = {}
): SemanticQueryState<TData> => {
   const hasCurrentDataField = hasOwn(query, "currentData")
   const data = hasCurrentDataField ? query.currentData : query.data
   const hasData = data !== undefined

   if (query.isUninitialized) {
      if (
         query.isLoading ||
         query.isFetching ||
         query.isSuccess ||
         query.isError ||
         hasData
      ) {
         return inconsistent("uninitialized_with_other_state")
      }
      return { status: "idle" }
   }

   if (query.isError) {
      if (query.error === undefined) return inconsistent("error_missing")
      const error = normalizeApiError(query.error)
      if (error.isAborted)
         return hasData
            ? { status: "aborted", error, data }
            : { status: "aborted", error }
      if (query.isFetching && hasData) return { status: "refreshing", data }
      return hasData
         ? { status: "stale_error", data, error }
         : { status: "error", error }
   }

   if (query.isFetching || query.isLoading) {
      return hasData
         ? { status: "refreshing", data }
         : { status: "initial_loading" }
   }

   if (query.isSuccess) {
      if (!hasData) return inconsistent("success_without_current_data")
      const isEmpty = options.isEmpty ?? isEmptyCollection
      if (isEmpty(data)) {
         return options.noResults
            ? { status: "no_results", data }
            : { status: "empty", data }
      }
      return { status: "success", data }
   }

   if (hasData) return inconsistent("data_without_terminal_or_active_state")
   return inconsistent("active_request_without_loading_or_fetching")
}
