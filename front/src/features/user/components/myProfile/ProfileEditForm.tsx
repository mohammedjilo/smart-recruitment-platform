import { Button, DialogActions, DialogContent, MenuItem, TextField } from "@mui/material"
import { useState, type FormEvent } from "react"
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
   ProfileEditFormType,
   ProfileEditDataByType,
   ProfileEditFormValues,
   ProfileEditField
} from "./profileEditForm.types"
import { showAlert } from "@/utils/swal"
import type { RootState } from "@/redux/store"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

type Props<TFormType extends ProfileEditFormType> = {
   formType: TFormType
   data: ProfileEditDataByType[TFormType]
   onSave: () => void
   onCancel: () => void
}

const ProfileEditForm = <TFormType extends ProfileEditFormType>({
   formType,
   data,
   onSave,
   onCancel
}: Props<TFormType>) => {
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const [values, setValues] = useState<ProfileEditFormValues>(data)
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

   const setValue = (key: ProfileEditField | "level", value: string) => {
      setValues(current => ({ ...current, [key]: value }))
   }

   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

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
      <TextField
         fullWidth
         label={label}
         value={values[key] ?? ""}
         onChange={event => setValue(key, event.target.value)}
         multiline={multiline}
         minRows={multiline ? 3 : undefined}
         disabled={isLoading}
      />
   )

   return (
      <form onSubmit={handleSubmit}>
         <DialogContent className="grid gap-4! pt-2!">
            {formType === "experience" && (
               <>
                  {field("companyName", "Company Name")}
                  {field("position", "Position")}
                  {field("description", "Description", true)}
                  {field("startDate", "Start Date")}
                  {field("endDate", "End Date")}
               </>
            )}
            {formType === "education" && (
               <>
                  {field("university", "University")}
                  {field("degree", "Degree")}
                  {field("major", "Major")}
                  {field("startDate", "Start Date")}
                  {field("endDate", "End Date")}
               </>
            )}
            {formType === "project" && (
               <>
                  {field("title", "Project Title")}
                  {field("description", "Description", true)}
               </>
            )}
            {formType === "certificate" && (
               <>
                  {field("certificateName", "Certificate Name")}
                  {field("organization", "Issuing Organization")}
               </>
            )}
            {formType === "skill" && field("skillName", "Skill Name")}
            {formType === "language" && (
               <TextField
                  select
                  fullWidth
                  label="Language Level"
                  value={values.level ?? ""}
                  onChange={event => setValue("level", event.target.value)}
                  disabled={isLoading}>
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
            {formType === "professionalProfile" && (
               <>
                  {field("jobTitle", "Job Title")}
                  {field("summary", "Summary", true)}
                  {field("yearsOfExperience", "Years of Experience")}
                  {field("cvPath", "CV Path")}
               </>
            )}
         </DialogContent>
         <DialogActions className="px-6! pb-4!">
            <Button
               onClick={onCancel}
               variant="outlined"
               disabled={isLoading}
               className="normal-case!">
               Cancel
            </Button>
            <Button
               type="submit"
               variant="contained"
               disabled={isLoading}
               className="normal-case!">
               {isLoading ? "Updating..." : "Update"}
            </Button>
         </DialogActions>
      </form>
   )
}

export default ProfileEditForm
