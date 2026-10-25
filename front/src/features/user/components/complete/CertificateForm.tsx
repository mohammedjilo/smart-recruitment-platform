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
               aria-live="assertive"
               role="alert">
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
                        placeholder="e.g. AWS Certified Developer"
                        error={!!errors.certificateName}
                        fullWidth
                        helperText={errors.certificateName?.message}
                        label="Certificate Name"
                        size="medium"
                        slotProps={{ inputLabel: { shrink: true } }}
                        variant="outlined"
                     />
                  )}
               />
               <Controller
                  name="organization"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        placeholder="e.g. Amazon Web Services"
                        error={!!errors.organization}
                        fullWidth
                        helperText={errors.organization?.message}
                        label="Issuing Organization"
                        size="medium"
                        slotProps={{ inputLabel: { shrink: true } }}
                        variant="outlined"
                     />
                  )}
               />
            </Box>

            <Box className="mt-5 flex justify-end gap-3">
               <Button
                  className="normal-case!"
                  variant="outlined"
                  onClick={onCancel}>
                  Cancel
               </Button>
               <Button
                  className="normal-case!"
                  type="submit"
                  disabled={isLoading}
                  variant="contained">
                  {isLoading ? "Saving..." : "Save Certificate"}
               </Button>
            </Box>
         </form>
      </Box>
   )
}

export default CertificateForm
