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
               aria-live="assertive"
               role="alert">
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
                           placeholder="e.g. Harvard University"
                           error={!!errors.university}
                           fullWidth
                           helperText={errors.university?.message}
                           label="University"
                           size="medium"
                           slotProps={{ inputLabel: { shrink: true } }}
                           variant="outlined"
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
                        placeholder="e.g. Bachelor's, Master's"
                        error={!!errors.degree}
                        fullWidth
                        helperText={errors.degree?.message}
                        label="Degree"
                        size="medium"
                        slotProps={{ inputLabel: { shrink: true } }}
                        variant="outlined"
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
                        placeholder="e.g. Computer Science"
                        error={!!errors.major}
                        fullWidth
                        helperText={errors.major?.message}
                        label="Major"
                        size="medium"
                        slotProps={{ inputLabel: { shrink: true } }}
                        variant="outlined"
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
                        type="date"
                        error={!!errors.startDate}
                        fullWidth
                        helperText={errors.startDate?.message}
                        label="Start Date"
                        size="medium"
                        slotProps={{ inputLabel: { shrink: true } }}
                        variant="outlined"
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
                        type="date"
                        error={!!errors.endDate}
                        fullWidth
                        helperText={errors.endDate?.message}
                        label="End Date (Optional)"
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
                  {isLoading ? "saving..." : "Save Education"}
               </Button>
            </Box>
         </form>
      </Box>
   )
}

export default EducationForm
