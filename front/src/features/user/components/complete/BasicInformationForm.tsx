import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Box, Typography, TextField, Button } from "@mui/material"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
   basicInformationSchema,
   type BasicInformationFormValues
} from "@/schema/basicInformation"
import { useUpdateBasicInformationMutation } from "@/features/user/services/professionalProfileApiCalls"
import { showAlert } from "@/utils/swal"
import { getMutationState } from "@/utils/mutationState"
import { applyApiFieldErrors, getApiErrorDetails } from "@/utils/formErrors"
import { getMutationPresentation } from "@/utils/presentationPolicy"

interface Props {
   onSave: (data: BasicInformationFormValues) => void
   onCancel: () => void
}

const BasicInformationForm: React.FC<Props> = ({ onSave, onCancel }) => {
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const {
      control,
      handleSubmit,
      setError,
      formState: { errors }
   } = useForm<BasicInformationFormValues>({
      resolver: zodResolver(basicInformationSchema),
      defaultValues: {
         jobTitle: "",
         summary: undefined,
         yearsOfExperience: 0,
         cvPath: undefined
      }
   })

   const [updateBasicInformation, mutationResult] = useUpdateBasicInformationMutation()
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

   const onSubmit = async (values: BasicInformationFormValues) => {
      try {
         if (!userId) return
         await updateBasicInformation({ userId, data: values }).unwrap()
         onSave(values)
      } catch (error) {
         const normalizedError = getApiErrorDetails(error)
         if (normalizedError.isAborted) return
         applyApiFieldErrors(error, setError)
      }
   }

   useEffect(() => {
      if (mutationPresentation.category === "contextual_success") {
         showAlert({ type: "success", text: data?.message })
      }
   }, [mutationPresentation.category, data?.message])

   return (
      <Box className="bg-surface mt-4 rounded-xl border border-[#E7EAF0] p-5">
         <Typography
            className="mb-4"
            variant="h6">
            Add Basic Information
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
            <Box className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
               <Controller
                  name="jobTitle"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        fullWidth
                        label="Job Title"
                        placeholder="e.g. Frontend Developer"
                        variant="outlined"
                        size="medium"
                        error={!!errors.jobTitle}
                        helperText={errors.jobTitle?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                     />
                  )}
               />

               <Controller
                  name="yearsOfExperience"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        fullWidth
                        label="Years of Experience"
                        type="number"
                        variant="outlined"
                        size="medium"
                        error={!!errors.yearsOfExperience}
                        helperText={errors.yearsOfExperience?.message}
                        slotProps={{
                           inputLabel: { shrink: true },
                           htmlInput: { min: 0 }
                        }}
                        onChange={e =>
                           field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                           )
                        }
                     />
                  )}
               />

               <Box className="md:col-span-2">
                  <Controller
                     name="summary"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           fullWidth
                           label="Summary (Optional)"
                           placeholder="Short bio about yourself..."
                           multiline
                           rows={4}
                           variant="outlined"
                           size="medium"
                           error={!!errors.summary}
                           helperText={errors.summary?.message}
                           slotProps={{ inputLabel: { shrink: true } }}
                        />
                     )}
                  />
               </Box>

               <Box className="md:col-span-2">
                  <Controller
                     name="cvPath"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           fullWidth
                           label="CV URL (Optional)"
                           placeholder="https://example.com/resume.pdf"
                           variant="outlined"
                           size="medium"
                           error={!!errors.cvPath}
                           helperText={errors.cvPath?.message}
                           slotProps={{ inputLabel: { shrink: true } }}
                        />
                     )}
                  />
               </Box>
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
                  {isLoading ? "Saving..." : "Save Basic Information"}
               </Button>
            </Box>
         </form>
      </Box>
   )
}

export default BasicInformationForm
