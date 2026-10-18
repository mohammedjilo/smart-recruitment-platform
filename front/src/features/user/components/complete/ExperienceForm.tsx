import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Box, Typography, TextField, Button } from "@mui/material"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { experienceSchema, type ExperienceFormValues } from "@/schema/experience"
import { useAddExperienceMutation } from "@/features/user/services/experienceApiCalls"
import { showAlert } from "@/utils/swal"
import { getMutationState } from "@/utils/mutationState"
import { applyApiFieldErrors, getApiErrorDetails } from "@/utils/formErrors"
import { getMutationPresentation } from "@/utils/presentationPolicy"

interface Props {
   onSave: (data: ExperienceFormValues) => void
   onCancel: () => void
}

const ExperienceForm: React.FC<Props> = ({ onSave, onCancel }) => {
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const {
      control,
      handleSubmit,
      setError,
      formState: { errors }
   } = useForm<ExperienceFormValues>({
      resolver: zodResolver(experienceSchema),
      defaultValues: {
         companyName: "",
         position: "",
         description: "",
         startDate: "",
         endDate: undefined
      }
   })

   const [addExperience, mutationResult] = useAddExperienceMutation()
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

   const onSubmit = async (data: ExperienceFormValues) => {
      try {
         if (!userId) return
         await addExperience({
            userId,
            data: {
               ...data,
               description: data.description ?? undefined,
               endDate: data.endDate ?? undefined
            }
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
            Add Work Experience
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
               <Box className="md:col-span-2">
                  <Controller
                     name="companyName"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           fullWidth
                           label="Company Name"
                           placeholder="e.g. Google"
                           variant="outlined"
                           size="medium"
                           error={!!errors.companyName}
                           helperText={errors.companyName?.message}
                           slotProps={{ inputLabel: { shrink: true } }}
                        />
                     )}
                  />
               </Box>

               <Box className="md:col-span-2">
                  <Controller
                     name="position"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           fullWidth
                           label="Position / Job Title"
                           placeholder="e.g. Software Engineer"
                           variant="outlined"
                           size="medium"
                           error={!!errors.position}
                           helperText={errors.position?.message}
                           slotProps={{ inputLabel: { shrink: true } }}
                        />
                     )}
                  />
               </Box>

               <Box className="md:col-span-2">
                  <Controller
                     name="description"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           fullWidth
                           label="Description (Optional)"
                           placeholder="Describe your responsibilities and achievements..."
                           multiline
                           rows={3}
                           variant="outlined"
                           size="medium"
                           error={!!errors.description}
                           helperText={errors.description?.message}
                           slotProps={{ inputLabel: { shrink: true } }}
                        />
                     )}
                  />
               </Box>

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
                  {isLoading ? "Saving..." : "Save Experience"}
               </Button>
            </Box>
         </form>
      </Box>
   )
}

export default ExperienceForm
