import { Button, DialogActions, DialogContent, MenuItem, TextField } from "@mui/material"
import FormErrorAlert from "@/components/common/FormErrorAlert"
import { useSelector } from "react-redux"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { useAddUserLanguageMutation } from "@/features/user/services/languageApiCalls"
import type { RootState } from "@/redux/store"
import type { LanguageLevel } from "@/types/language"
import { showAlert } from "@/utils/swal"
import { getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { applyApiFieldErrors, getApiErrorDetails } from "@/utils/formErrors"

const languageLevels = [
   "BEGINNER",
   "INTERMEDIATE",
   "ADVANCED",
   "FLUENT",
   "NATIVE"
] as const

const languageFormSchema = z.object({
   languageName: z.string().trim().min(1, "Language name is required"),
   level: z.enum(languageLevels, {
      message: "Language level is required"
   })
})

type LanguageFormValues = z.infer<typeof languageFormSchema>

type Props = {
   onSave: () => void
   onCancel: () => void
}

const LanguageForm = ({ onSave, onCancel }: Props) => {
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const {
      control,
      handleSubmit,
      setError,
      formState: { errors }
   } = useForm<LanguageFormValues>({
      resolver: zodResolver(languageFormSchema),
      defaultValues: {
         languageName: "",
         level: undefined as unknown as LanguageLevel
      }
   })

   const [addUserLanguage, mutationResult] = useAddUserLanguageMutation()
   const mutationState = getMutationState(mutationResult)
   const mutationPresentation = getMutationPresentation(mutationState, {
      surface: "form"
   })
   const isLoading = mutationPresentation.category === "loading"
   const formError =
      mutationPresentation.category === "form_error" ||
      mutationPresentation.category === "authentication_notice" ||
      mutationPresentation.category === "access_denied" ||
      mutationPresentation.category === "resource_not_found"
         ? mutationPresentation.message
         : null

   const onSubmit = async (data: LanguageFormValues) => {
      try {
         if (!userId) return
         await addUserLanguage({
            userId,
            data: {
               languageName: data.languageName.trim(),
               level: data.level
            }
         }).unwrap()

         if (
            getMutationPresentation({ status: "success" }, { surface: "form" })
               .category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: "Language created",
               text: "The language was created successfully."
            })
         }

         onSave()
      } catch (error) {
         const normalizedError = getApiErrorDetails(error)
         if (normalizedError.isAborted) return
         applyApiFieldErrors(error, setError)
      }
   }

   return (
      <form onSubmit={handleSubmit(onSubmit)}>
         <DialogContent className="grid gap-4! pt-2!">
            <FormErrorAlert message={formError} />
            <Controller
               name="languageName"
               control={control}
               render={({ field }) => (
                  <TextField
                     {...field}
                     autoFocus
                     fullWidth
                     label="Language Name"
                     placeholder="e.g. English"
                     disabled={isLoading}
                     error={!!errors.languageName}
                     helperText={errors.languageName?.message}
                  />
               )}
            />

            <Controller
               name="level"
               control={control}
               render={({ field }) => (
                  <TextField
                     {...field}
                     select
                     fullWidth
                     label="Language Level"
                     value={field.value ?? ""}
                     onChange={event =>
                        field.onChange(event.target.value as LanguageLevel)
                     }
                     disabled={isLoading}
                     error={!!errors.level}
                     helperText={errors.level?.message}>
                     {languageLevels.map(level => (
                        <MenuItem
                           key={level}
                           value={level}>
                           {level.charAt(0) + level.slice(1).toLowerCase()}
                        </MenuItem>
                     ))}
                  </TextField>
               )}
            />
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
               {isLoading ? "Creating..." : "Create"}
            </Button>
         </DialogActions>
      </form>
   )
}

export default LanguageForm
