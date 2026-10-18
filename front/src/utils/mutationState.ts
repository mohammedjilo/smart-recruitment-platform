import {
   normalizeApiError,
   type NormalizedApiError
} from "./apiError.ts"

export type SemanticMutationState<TData = unknown> =
   | { status: "idle" }
   | { status: "submitting" }
   | { status: "success"; data?: TData }
   | { status: "error"; error: NormalizedApiError }
   | { status: "aborted"; error: NormalizedApiError }
   | {
        status: "inconsistent"
        reason:
           | "uninitialized_with_other_state"
           | "loading_with_terminal_state"
           | "success_and_error"
           | "success_with_error"
           | "error_missing"
           | "no_lifecycle_state"
     }

export type MutationActionOutcome<TData = unknown> = Extract<
   SemanticMutationState<TData>,
   { status: "success" | "error" | "aborted" }
>

export interface RawMutationState<TData> {
   isUninitialized: boolean
   isLoading: boolean
   isSuccess: boolean
   isError: boolean
   data?: TData
   error?: unknown
}

const hasOwn = <T extends object>(value: T, key: PropertyKey) =>
   Object.prototype.hasOwnProperty.call(value, key)

const inconsistent = (
   reason: Extract<
      SemanticMutationState<never>,
      { status: "inconsistent" }
   >["reason"]
): SemanticMutationState<never> => ({ status: "inconsistent", reason })

export const getMutationState = <TData>(
   mutation: RawMutationState<TData>
): SemanticMutationState<TData> => {
   const hasData = hasOwn(mutation, "data") && mutation.data !== undefined
   const hasError = mutation.error !== undefined
   const hasTerminalState = mutation.isSuccess || mutation.isError

   if (mutation.isUninitialized) {
      if (
         mutation.isLoading ||
         hasTerminalState ||
         hasData ||
         hasError
      ) {
         return inconsistent("uninitialized_with_other_state")
      }
      return { status: "idle" }
   }

   if (mutation.isLoading) {
      if (hasTerminalState || hasError) {
         return inconsistent("loading_with_terminal_state")
      }
      return { status: "submitting" }
   }

   if (mutation.isSuccess && mutation.isError) {
      return inconsistent("success_and_error")
   }

   if (mutation.isSuccess && hasError) {
      return inconsistent("success_with_error")
   }

   if (mutation.isError) {
      if (!hasError) return inconsistent("error_missing")
      const error = normalizeApiError(mutation.error)
      return error.isAborted
         ? { status: "aborted", error }
         : { status: "error", error }
   }

   if (mutation.isSuccess) {
      return mutation.data === undefined
         ? { status: "success" }
         : { status: "success", data: mutation.data }
   }

   return inconsistent("no_lifecycle_state")
}

export const getMutationErrorState = (
   error: unknown
): SemanticMutationState<never> =>
   getMutationState({
      isUninitialized: false,
      isLoading: false,
      isSuccess: false,
      isError: true,
      error
   })
