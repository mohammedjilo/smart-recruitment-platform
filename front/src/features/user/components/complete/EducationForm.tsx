import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Typography, TextField, Button } from "@mui/material"
import { educationSchema, type EducationFormValues } from "@/schema/education"
import { useAddEducationMutation } from "@/features/user/services/educationApiCalls"
import { showAlert } from "@/utils/swal"
import { getMutationState } from "@/utils/mutationState"
import { applyApiFieldErrors, getApiErrorDetails } from "@/utils/formErrors"
import { getMutationPresentation } from "@/utils/presentationPolicy"

interface Props {
   onSave: (data: EducationFormValues) => void
   onCancel: () => void
}

const EducationForm: React.FC<Props> = ({ onSave, onCancel }) => {
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const {
      control,
      handleSubmit,
      setError,
      formState: { errors }
   } = useForm<EducationFormValues>({
      resolver: zodResolver(educationSchema),
      defaultValues: {
         university: "",
         degree: "",
         major: "",
         startDate: "",
         endDate: undefined
      }
   })
   const [addEducation, mutationResult] = useAddEducationMutation()
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
   const onSubmit = async (data: EducationFormValues) => {
      try {
         if (!userId) return
         await addEducation({
            userId,
            data: { ...data, endDate: data.endDate ?? undefined }
         }).unwrap()
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
            Add Education
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
               {/* University */}
               <Box className="md:col-span-2">
                  <Controller
                     name="university"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           fullWidth
                           label="University"
                           placeholder="e.g. Harvard University"
                           variant="outlined"
                           size="medium"
                           error={!!errors.university}
                           helperText={errors.university?.message}
                           slotProps={{ inputLabel: { shrink: true } }}
                        />
                     )}
                  />
               </Box>

               {/* Degree */}
               <Controller
                  name="degree"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        fullWidth
                        label="Degree"
                        placeholder="e.g. Bachelor's, Master's"
                        variant="outlined"
                        size="medium"
                        error={!!errors.degree}
                        helperText={errors.degree?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                     />
                  )}
               />

               {/* Major */}
               <Controller
                  name="major"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        fullWidth
                        label="Major"
                        placeholder="e.g. Computer Science"
                        variant="outlined"
                        size="medium"
                        error={!!errors.major}
                        helperText={errors.major?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                     />
                  )}
               />

               {/* Start Date */}
               <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        fullWidth
                        label="Start Date"
                        type="date"
                        variant="outlined"
                        size="medium"
                        error={!!errors.startDate}
                        helperText={errors.startDate?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                     />
                  )}
               />

               {/* End Date (Optional) */}
               <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        fullWidth
                        label="End Date (Optional)"
                        type="date"
                        variant="outlined"
                        size="medium"
                        error={!!errors.endDate}
                        helperText={errors.endDate?.message}
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
                  {isLoading ? "saving..." : "Save Education"}
               </Button>
            </Box>
         </form>
      </Box>
   )
}

export default EducationForm
