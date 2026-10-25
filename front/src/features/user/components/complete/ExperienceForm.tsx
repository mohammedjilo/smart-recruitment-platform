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
               aria-live="assertive"
               role="alert">
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
                           placeholder="e.g. Google"
                           error={!!errors.companyName}
                           fullWidth
                           helperText={errors.companyName?.message}
                           label="Company Name"
                           size="medium"
                           slotProps={{ inputLabel: { shrink: true } }}
                           variant="outlined"
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
                           placeholder="e.g. Software Engineer"
                           error={!!errors.position}
                           fullWidth
                           helperText={errors.position?.message}
                           label="Position / Job Title"
                           size="medium"
                           slotProps={{ inputLabel: { shrink: true } }}
                           variant="outlined"
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
                           placeholder="Describe your responsibilities and achievements..."
                           error={!!errors.description}
                           fullWidth
                           helperText={errors.description?.message}
                           label="Description (Optional)"
                           multiline
                           rows={3}
                           size="medium"
                           slotProps={{ inputLabel: { shrink: true } }}
                           variant="outlined"
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
                  {isLoading ? "Saving..." : "Save Experience"}
               </Button>
            </Box>
         </form>
      </Box>
   )
}

export default ExperienceForm
