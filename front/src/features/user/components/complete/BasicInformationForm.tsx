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
import {
   useGetProfessionalProfileQuery,
   useUpdateProfessionalProfileMutation
} from "@/features/user/services/professionalProfileApiCalls"
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
      reset,
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

   const { data: professionalProfileData } = useGetProfessionalProfileQuery(
      userId ?? "",
      { skip: !userId }
   )
   const profile = professionalProfileData?.data.profile

   useEffect(() => {
      if (!profile) return

      reset({
         jobTitle: profile.jobTitle ?? "",
         summary: profile.summary ?? undefined,
         yearsOfExperience: profile.yearsOfExperience ?? 0,
         cvPath: profile.cvPath ?? undefined
      })
   }, [profile, reset])

   const [updateProfessionalProfile, mutationResult] = useUpdateProfessionalProfileMutation()
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
         await updateProfessionalProfile({ userId, data: values }).unwrap()
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
            Edit Professional Information
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
            <Box className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
               <Controller
                  name="jobTitle"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        placeholder="e.g. Frontend Developer"
                        error={!!errors.jobTitle}
                        fullWidth
                        helperText={errors.jobTitle?.message}
                        label="Job Title"
                        size="medium"
                        slotProps={{ inputLabel: { shrink: true } }}
                        variant="outlined"
                     />
                  )}
               />

               <Controller
                  name="yearsOfExperience"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        type="number"
                        error={!!errors.yearsOfExperience}
                        fullWidth
                        helperText={errors.yearsOfExperience?.message}
                        label="Years of Experience"
                        size="medium"
                        slotProps={{
                           inputLabel: { shrink: true },
                           htmlInput: { min: 0 }
                        }}
                        variant="outlined"
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
                           placeholder="Short bio about yourself..."
                           error={!!errors.summary}
                           fullWidth
                           helperText={errors.summary?.message}
                           label="Summary (Optional)"
                           multiline
                           rows={4}
                           size="medium"
                           slotProps={{ inputLabel: { shrink: true } }}
                           variant="outlined"
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
                           placeholder="https://example.com/resume.pdf"
                           error={!!errors.cvPath}
                           fullWidth
                           helperText={errors.cvPath?.message}
                           label="CV URL (Optional)"
                           size="medium"
                           slotProps={{ inputLabel: { shrink: true } }}
                           variant="outlined"
                        />
                     )}
                  />
               </Box>
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
                  {isLoading ? "Saving..." : "Save Professional Information"}
               </Button>
            </Box>
         </form>
      </Box>
   )
}

export default BasicInformationForm
