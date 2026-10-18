import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Box, Typography, TextField, Button } from "@mui/material"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { projectSchema, type ProjectFormValues } from "@/schema/project"
import { useAddProjectMutation } from "@/features/user/services/projectApiCalls"
import { showAlert } from "@/utils/swal"
import { getMutationState } from "@/utils/mutationState"
import { applyApiFieldErrors, getApiErrorDetails } from "@/utils/formErrors"
import { getMutationPresentation } from "@/utils/presentationPolicy"

interface Props {
   onSave: (data: ProjectFormValues) => void
   onCancel: () => void
}

const ProjectForm: React.FC<Props> = ({ onSave, onCancel }) => {
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const {
      control,
      handleSubmit,
      setError,
      formState: { errors }
   } = useForm<ProjectFormValues>({
      resolver: zodResolver(projectSchema),
      defaultValues: { title: "", description: "" }
   })

   const [addProject, mutationResult] = useAddProjectMutation()
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

   const onSubmit = async (data: ProjectFormValues) => {
      try {
         if (!userId) return
         await addProject({
            userId,
            data: { ...data, description: data.description ?? undefined }
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
            Add Project
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
                  name="title"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        fullWidth
                        label="Project Title"
                        placeholder="e.g. E-commerce Website"
                        variant="outlined"
                        size="medium"
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                     />
                  )}
               />
               <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        fullWidth
                        label="Description (Optional)"
                        placeholder="Describe the project, technologies used, your role..."
                        multiline
                        rows={4}
                        variant="outlined"
                        size="medium"
                        error={!!errors.description}
                        helperText={errors.description?.message}
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
                  {isLoading ? "Saving..." : "Save Project"}
               </Button>
            </Box>
         </form>
      </Box>
   )
}

export default ProjectForm
