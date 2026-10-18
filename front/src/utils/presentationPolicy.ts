import type { NormalizedApiError } from "./apiError"
import type { SemanticMutationState } from "./mutationState"
import type { SemanticQueryState } from "./queryState"

export type PresentationCategory =
   | "none"
   | "loading"
   | "content"
   | "empty"
   | "no_results"
   | "refreshing"
   | "field_error"
   | "form_error"
   | "inline_error"
   | "section_error"
   | "page_error"
   | "authentication_notice"
   | "access_denied"
   | "action_denied"
   | "resource_not_found"
   | "stale_error"
   | "toast"
   | "dialog"
   | "contextual_success"
   | "silent"

export interface PresentationDecision {
   category: PresentationCategory
   message?: string
   preserveContent?: boolean
   retry?: "explicit"
}

export type PresentationContext =
   | { surface: "form" }
   | { surface: "page" }
   | { surface: "section" }
   | { surface: "action"; importance?: "routine" | "important" }

export type QueryPresentationContext = "page" | "section"

const genericSafeMessage = "Something went wrong. Please try again later."

const destinationErrorCategory = (
   context: PresentationContext
): PresentationCategory => {
   switch (context.surface) {
      case "form":
         return "form_error"
      case "page":
         return "page_error"
      case "section":
         return "section_error"
      case "action":
         return "toast"
   }
}

export const getPresentationMessage = (
   error: NormalizedApiError,
   contextualFallback?: string
): string => {
   const safeMessage = error.message.trim()
   if (safeMessage) return safeMessage

   const fallback = contextualFallback?.trim()
   return fallback || genericSafeMessage
}

export const getErrorPresentation = (
   error: NormalizedApiError,
   context: PresentationContext
): PresentationDecision => {
   if (error.isAborted || error.kind === "aborted")
      return { category: "silent" }

   const message = getPresentationMessage(error)

   if (
      context.surface === "form" &&
      error.kind === "validation" &&
      Object.keys(error.fieldErrors ?? {}).length > 0
   ) {
      return { category: "field_error", message }
   }

   if (error.kind === "authentication") {
      return { category: "authentication_notice", message }
   }

   if (error.kind === "authorization") {
      return {
         category:
            context.surface === "action" ? "action_denied" : "access_denied",
         message
      }
   }

   if (error.kind === "not_found") {
      return {
         category:
            context.surface !== "action"
               ? "resource_not_found"
               : context.importance === "important"
                 ? "dialog"
                 : "toast",
         message
      }
   }

   if (context.surface === "action") {
      const requiresAcknowledgement =
         context.importance === "important" &&
         (error.kind === "business" || error.kind === "conflict")

      return {
         category: requiresAcknowledgement ? "dialog" : "toast",
         message
      }
   }

   return {
      category: destinationErrorCategory(context),
      message
   }
}

export const getQueryPresentation = <TData>(
   state: SemanticQueryState<TData>,
   context: QueryPresentationContext
): PresentationDecision => {
   switch (state.status) {
      case "idle":
         return { category: "none" }
      case "initial_loading":
         return { category: "loading" }
      case "success":
         return { category: "content" }
      case "empty":
         return { category: "empty" }
      case "no_results":
         return { category: "no_results" }
      case "refreshing":
         return { category: "refreshing", preserveContent: true }
      case "error":
         return {
            ...getErrorPresentation(state.error, { surface: context }),
            retry: "explicit"
         }
      case "stale_error":
         return {
            category: "stale_error",
            message: getPresentationMessage(state.error),
            preserveContent: true,
            ...(state.error.retryable ? { retry: "explicit" } : {})
         }
      case "aborted":
         return {
            category: "silent",
            ...(state.data === undefined ? {} : { preserveContent: true })
         }
      case "inconsistent":
         return {
            category: context === "page" ? "page_error" : "section_error",
            message: "Unable to determine the current results.",
            retry: "explicit"
         }
   }
}

const mutationInconsistentDecision = (
   context: PresentationContext
): PresentationDecision => ({
   category: destinationErrorCategory(context),
   message: "Unable to determine the result of this action."
})

export const getMutationPresentation = <TData>(
   state: SemanticMutationState<TData>,
   context: PresentationContext
): PresentationDecision => {
   switch (state.status) {
      case "idle":
         return { category: "none" }
      case "submitting":
         return { category: "loading" }
      case "success":
         return {
            category:
               context.surface === "action" && context.importance !== "important"
                  ? "toast"
                  : "contextual_success"
         }
      case "error":
         return {
            ...getErrorPresentation(state.error, context),
            ...(state.error.retryable ? { retry: "explicit" } : {})
         }
      case "aborted":
         return { category: "silent" }
      case "inconsistent":
         return mutationInconsistentDecision(context)
   }
}
