import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Box, Typography, TextField, Button, Chip, Stack } from "@mui/material"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { skillsSchema, type SkillsFormValues } from "@/schema/skill"
import { useAddSkillsMutation } from "@/features/user/services/skillApiCalls"
import { showAlert } from "@/utils/swal"
import { getMutationState } from "@/utils/mutationState"
import { applyApiFieldErrors, getApiErrorDetails } from "@/utils/formErrors"
import { getMutationPresentation } from "@/utils/presentationPolicy"

interface SkillFormData {
   skills: string[]
}

interface Props {
   onSave: (data: SkillFormData) => void
   onCancel: () => void
}

const SkillForm: React.FC<Props> = ({ onSave, onCancel }) => {
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const {
      control,
      handleSubmit,
      setError,
      setValue,
      watch,
      formState: { errors }
   } = useForm<SkillsFormValues>({
      resolver: zodResolver(skillsSchema),
      defaultValues: { skills: [] }
   })

   const [skillInput, setSkillInput] = useState("")
   const skills = watch("skills")
   const [addSkills, mutationResult] = useAddSkillsMutation()
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

   const addSkill = () => {
      const candidate = skillInput.trim()
      if (!candidate) return
      if (skills.includes(candidate)) {
         setSkillInput("")
         return
      }
      setValue("skills", [...skills, candidate], { shouldValidate: true })
      setSkillInput("")
   }

   const removeSkill = (skill: string) => {
      setValue(
         "skills",
         skills.filter((s: string) => s !== skill),
         { shouldValidate: true }
      )
   }

   const onSubmit = async (data: SkillsFormValues) => {
      try {
         if (!userId) return
         await addSkills({ userId, skills: data.skills }).unwrap()
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
            Add Skills
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
            <Box className="mt-2 flex gap-2">
               <TextField
                  fullWidth
                  label="Skill Name"
                  placeholder="e.g. React, TypeScript, Leadership"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                     if (e.key === "Enter") {
                        e.preventDefault()
                        addSkill()
                     }
                  }}
                  variant="outlined"
                  size="medium"
                  error={!!errors.skills}
                  helperText={errors.skills?.message as string}
                  slotProps={{ inputLabel: { shrink: true } }}
               />
               <Button
                  className="app-button-primary h-14! normal-case!"
                  variant="contained"
                  onClick={addSkill}>
                  Add
               </Button>
            </Box>

            <Controller
               name="skills"
               control={control}
               render={() => (
                  <>
                     {skills.length > 0 && (
                        <Stack
                           className="mt-4 flex-wrap"
                           direction="row"
                           spacing={1}>
                           {skills.map((skill: string) => (
                              <Chip
                                 key={skill}
                                 label={skill}
                                 onDelete={() => removeSkill(skill)}
                                 className="mb-2! bg-[#F3EFFF]! text-[#6741E8]!"
                              />
                           ))}
                        </Stack>
                     )}
                  </>
               )}
            />

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
                  {isLoading ? "Saving..." : "Save Skills"}
               </Button>
            </Box>
         </form>
      </Box>
   )
}

export default SkillForm
