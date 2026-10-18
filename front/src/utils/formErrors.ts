import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form"
import { normalizeApiError } from "./apiError"

export const getApiErrorDetails = normalizeApiError

export const applyApiFieldErrors = <TFieldValues extends FieldValues>(
   error: unknown,
   setError: UseFormSetError<TFieldValues>
) => {
   const { fieldErrors } = normalizeApiError(error)
   if (!fieldErrors) return

   Object.entries(fieldErrors).forEach(([field, message]) => {
      setError(field as FieldPath<TFieldValues>, {
         type: "server",
         message
      })
   })
}
