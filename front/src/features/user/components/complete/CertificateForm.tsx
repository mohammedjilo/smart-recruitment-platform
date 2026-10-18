import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Box, Typography, TextField, Button } from "@mui/material"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { certificateSchema, type CertificateFormValues } from "@/schema/certification"
import { useAddCertificationMutation } from "@/features/user/services/certificationApiCalls"
import { showAlert } from "@/utils/swal"
import { getMutationState } from "@/utils/mutationState"
import { applyApiFieldErrors, getApiErrorDetails } from "@/utils/formErrors"
import { getMutationPresentation } from "@/utils/presentationPolicy"

interface Props {
   onSave: (data: CertificateFormValues) => void
   onCancel: () => void
}

const CertificateForm: React.FC<Props> = ({ onSave, onCancel }) => {
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const {
      control,
      handleSubmit,
      setError,
      formState: { errors }
   } = useForm<CertificateFormValues>({
      resolver: zodResolver(certificateSchema),
      defaultValues: { certificateName: "", organization: "" }
   })

   const [addCertification, mutationResult] = useAddCertificationMutation()
   const mutationState = getMutationState(mutationResult)
   const mutationPresentation = getMutationPresentation(mutationState, {
      surface: "form"
   })
   const isLoading = mutationPresentation.category === "loading"
   const data = mutationState.status === "success" ? mutationState.data : undefined
   const formError =
      mutationPresentation.category === "form_error" ||
      mutationPresentation.category === "authentication_notice" ||
      mutationPresentation.category === "access_denied" ||
      mutationPresentation.category === "resource_not_found"
         ? mutationPresentation.message
         : null

   const onSubmit = async (data: CertificateFormValues) => {
      try {
         if (!userId) return
         await addCertification({ userId, data }).unwrap()
         onSave(data)
      } catch (error) {
         const normalizedError = getApiErrorDetails(error)
         if (normalizedError.isAborted) return
         applyApiFieldErrors(error, setError)
      }
   }
   useEffect(() => {
      if (mutationPresentation.category === "contextual_success") {
         showAlert({ type: "success", text: data?.message })
         //  reset()
      }
   }, [mutationPresentation.category, data?.message])
   return (
      <Box className="bg-surface mt-4 rounded-xl border border-[#E7EAF0] p-5">
         <Typography
            className="mb-4"
            variant="h6">
            Add Certificate
         </Typography>

         {formError && (
            <Box
               className="mb-4"
               role="alert"
               aria-live="assertive">
               <Typography color="error">{formError}</Typography>
            </Box>
         )}
         <form onSubmit={handleSubmit(onSubmit)}>
            <Box className="mt-2 grid grid-cols-1 gap-4">
               <Controller
                  name="certificateName"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        fullWidth
                        label="Certificate Name"
                        placeholder="e.g. AWS Certified Developer"
                        variant="outlined"
                        size="medium"
                        error={!!errors.certificateName}
                        helperText={errors.certificateName?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                     />
                  )}
               />
               <Controller
                  name="organization"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        fullWidth
                        label="Issuing Organization"
                        placeholder="e.g. Amazon Web Services"
                        variant="outlined"
                        size="medium"
                        error={!!errors.organization}
                        helperText={errors.organization?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                     />
                  )}
               />
            </Box>

            <Box className="mt-5 flex justify-end gap-3">
               <Button
                  variant="outlined"
                  onClick={onCancel}
                  className="normal-case!">
                  Cancel
               </Button>
               <Button
                  className="normal-case!"
                  type="submit"
                  variant="contained"
                  disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Certificate"}
               </Button>
            </Box>
         </form>
      </Box>
   )
}

export default CertificateForm
