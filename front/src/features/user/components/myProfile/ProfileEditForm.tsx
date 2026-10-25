import { Box, Button, DialogActions, DialogContent, MenuItem, TextField } from "@mui/material"
import { Controller, useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { useUpdateExperienceMutation } from "@/features/user/services/experienceApiCalls"
import { useUpdateEducationMutation } from "@/features/user/services/educationApiCalls"
import { useUpdateProjectMutation } from "@/features/user/services/projectApiCalls"
import { useUpdateCertificationMutation } from "@/features/user/services/certificationApiCalls"
import { useUpdateSkillsMutation } from "@/features/user/services/skillApiCalls"
import { useUpdateProfessionalProfileMutation } from "@/features/user/services/professionalProfileApiCalls"
import { useUpdateUserLanguageMutation } from "@/features/user/services/languageApiCalls"
import type { LanguageLevel } from "@/types/language"
import type {
   CertificateBody,
   EducationBody,
   ExperienceBody,
   ProjectBody
} from "@/types/api/profile"
import type {
   EditableProfileFormType,
   ProfileEditDataByType,
   ProfileEditFormValues,
   ProfileEditField
} from "./profileEditForm.types"
import { showAlert } from "@/utils/swal"
import type { RootState } from "@/redux/store"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

type Props<TFormType extends EditableProfileFormType> = {
   formType: TFormType
   data: ProfileEditDataByType[TFormType]
   onSave: () => void
   onCancel: () => void
}

const ProfileEditForm = <TFormType extends EditableProfileFormType>({
   formType,
   data,
   onSave,
   onCancel
}: Props<TFormType>) => {
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const { control, handleSubmit } = useForm<ProfileEditFormValues>({
      mode: "onSubmit",
      defaultValues: data
   })
   const [updateExperience, experienceState] = useUpdateExperienceMutation()
   const [updateEducation, educationState] = useUpdateEducationMutation()
   const [updateProject, projectState] = useUpdateProjectMutation()
   const [updateCertificate, certificateState] = useUpdateCertificationMutation()
   const [updateSkills, skillsState] = useUpdateSkillsMutation()
   const [updateProfile, profileState] = useUpdateProfessionalProfileMutation()
   const [updateLanguage, languageState] = useUpdateUserLanguageMutation()

   const experienceMutationState = getMutationState(experienceState)
   const educationMutationState = getMutationState(educationState)
   const projectMutationState = getMutationState(projectState)
   const certificateMutationState = getMutationState(certificateState)
   const skillsMutationState = getMutationState(skillsState)
   const profileMutationState = getMutationState(profileState)
   const languageMutationState = getMutationState(languageState)
   const mutationPresentations = [
      getMutationPresentation(experienceMutationState, { surface: "form" }),
      getMutationPresentation(educationMutationState, { surface: "form" }),
      getMutationPresentation(projectMutationState, { surface: "form" }),
      getMutationPresentation(certificateMutationState, { surface: "form" }),
      getMutationPresentation(skillsMutationState, { surface: "form" }),
      getMutationPresentation(profileMutationState, { surface: "form" }),
      getMutationPresentation(languageMutationState, { surface: "form" })
   ]
   const isLoading = mutationPresentations.some(
      presentation => presentation.category === "loading"
   )

   const onSubmit = async (values: ProfileEditFormValues) => {
      try {
         if (!userId) return
         if (formType === "experience") {
            await updateExperience({
               userId,
               id: values.id,
               data: values as Partial<ExperienceBody>
            }).unwrap()
         } else if (formType === "education") {
            await updateEducation({
               userId,
               id: values.id,
               data: values as Partial<EducationBody>
            }).unwrap()
         } else if (formType === "project") {
            await updateProject({
               userId,
               id: values.id,
               data: values as Partial<ProjectBody>
            }).unwrap()
         } else if (formType === "certificate") {
            await updateCertificate({
               userId,
               id: values.id,
               data: values as Partial<CertificateBody>
            }).unwrap()
         } else if (formType === "skill") {
            const { allSkills, originalSkill, skillName } = values
            if (
               !Array.isArray(allSkills) ||
               typeof originalSkill !== "string" ||
               typeof skillName !== "string"
            ) {
               throw new Error("Skill edit data is incomplete.")
            }
            const skills = allSkills.map(skill =>
               skill === originalSkill ? skillName : skill
            )
            await updateSkills({ userId, skills }).unwrap()
         } else if (formType === "language") {
            if (!values.level) {
               throw new Error("Language edit data is incomplete.")
            }
            await updateLanguage({ userId, id: values.id, level: values.level }).unwrap()
         } else {
            await updateProfile({
               userId,
               data: {
                  jobTitle: typeof values.jobTitle === "string" ? values.jobTitle : "",
                  summary:
                     typeof values.summary === "string" ? values.summary : undefined,
                  yearsOfExperience:
                     typeof values.yearsOfExperience === "number"
                        ? values.yearsOfExperience
                        : values.yearsOfExperience
                          ? Number(values.yearsOfExperience)
                          : 0,
                  cvPath: typeof values.cvPath === "string" ? values.cvPath : undefined
               }
            }).unwrap()
         }

         if (
            getMutationPresentation({ status: "success" }, { surface: "form" })
               .category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: "Updated",
               text: "Information updated successfully."
            })
         }
         onSave()
      } catch (error) {
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "form"
         })
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Update failed",
            text: errorPresentation.message
         })
      }
   }

   const field = (key: ProfileEditField, label: string, multiline = false) => (
      <Controller
         name={key}
         control={control}
         render={({ field: formField }) => (
            <TextField
               {...formField}
               disabled={isLoading}
               value={formField.value ?? ""}
               fullWidth
               label={label}
               minRows={multiline ? 3 : undefined}
               multiline={multiline}
            />
         )}
      />
   )

   return (
      <form onSubmit={handleSubmit(onSubmit)}>
         <DialogContent className="grid gap-4! pt-2!">
            {formType === "experience" && (
               <Box className="contents">
                  {field("companyName", "Company Name")}
                  {field("position", "Position")}
                  {field("description", "Description", true)}
                  {field("startDate", "Start Date")}
                  {field("endDate", "End Date")}
               </Box>
            )}
            {formType === "education" && (
               <Box className="contents">
                  {field("university", "University")}
                  {field("degree", "Degree")}
                  {field("major", "Major")}
                  {field("startDate", "Start Date")}
                  {field("endDate", "End Date")}
               </Box>
            )}
            {formType === "project" && (
               <Box className="contents">
                  {field("title", "Project Title")}
                  {field("description", "Description", true)}
               </Box>
            )}
            {formType === "certificate" && (
               <Box className="contents">
                  {field("certificateName", "Certificate Name")}
                  {field("organization", "Issuing Organization")}
               </Box>
            )}
            {formType === "skill" && field("skillName", "Skill Name")}
            {formType === "language" && (
               <Controller
                  name="level"
                  control={control}
                  render={({ field: formField }) => (
                     <TextField
                        {...formField}
                        disabled={isLoading}
                        value={formField.value ?? ""}
                        fullWidth
                        label="Language Level"
                        select>
                        {(
                           [
                              "BEGINNER",
                              "INTERMEDIATE",
                              "ADVANCED",
                              "FLUENT",
                              "NATIVE"
                           ] as LanguageLevel[]
                        ).map(level => (
                           <MenuItem
                              key={level}
                              value={level}>
                              {level}
                           </MenuItem>
                        ))}
                     </TextField>
                  )}
               />
            )}
            {formType === "professionalProfile" && (
               <Box className="contents">
                  {field("jobTitle", "Job Title")}
                  {field("summary", "Summary", true)}
                  <Controller
                     name="yearsOfExperience"
                     control={control}
                     render={({ field: formField, fieldState }) => (
                        <TextField
                           {...formField}
                           disabled={isLoading}
                           value={formField.value ?? ""}
                           error={!!fieldState.error}
                           fullWidth
                           helperText={fieldState.error?.message}
                           label="Years of Experience"
                           slotProps={{ htmlInput: { inputMode: "numeric" } }}
                        />
                     )}
                     rules={{
                        validate: value =>
                           /^\d+$/.test(String(value ?? "").trim()) ||
                           "Enter a non-negative whole number of years."
                     }}
                  />
                  {field("cvPath", "CV Path")}
               </Box>
            )}
         </DialogContent>
         <DialogActions className="px-6! pb-4!">
            <Button
               className="normal-case!"
               disabled={isLoading}
               variant="outlined"
               onClick={onCancel}>
               Cancel
            </Button>
            <Button
               className="normal-case!"
               type="submit"
               disabled={isLoading}
               variant="contained">
               {isLoading ? "Updating..." : "Update"}
            </Button>
         </DialogActions>
      </form>
   )
}

export default ProfileEditForm
