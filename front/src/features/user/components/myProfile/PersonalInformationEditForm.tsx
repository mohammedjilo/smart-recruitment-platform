import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Box, Button, DialogActions, DialogContent, TextField } from "@mui/material"
import CountryCitySelector, {
   type LocationSelection
} from "@/components/common/CountryCitySelector"
import { useUpdateUserPersonalInformationMutation } from "@/features/user/services/userApiCalls"
import type { CompleteUserProfile } from "@/types/user"
import {
   personalInformationUpdateSchema,
   type PersonalInformationUpdateInput
} from "@smart-recruitment/validation"
import { showAlert } from "@/utils/swal"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

type PersonalInformationData = Pick<
   CompleteUserProfile,
   | "phone"
   | "birthdate"
   | "country"
   | "countryCode"
   | "state"
   | "stateCode"
   | "city"
   | "cityGeonameId"
>

type Props = {
   data: PersonalInformationData
   userId: string
   onSave: () => void
   onCancel: () => void
}

type PersonalInformationFormValues = z.input<
   typeof personalInformationUpdateSchema
>

const getDateInputValue = (value: string) => {
   const date = new Date(value)
   return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
}

const calculateAge = (birthdate: string) => {
   if (!birthdate) return ""
   const birth = new Date(`${birthdate}T00:00:00.000Z`)
   if (Number.isNaN(birth.getTime())) return ""
   const today = new Date()
   let age = today.getUTCFullYear() - birth.getUTCFullYear()
   if (
      today.getUTCMonth() < birth.getUTCMonth() ||
      (today.getUTCMonth() === birth.getUTCMonth() &&
         today.getUTCDate() < birth.getUTCDate())
   ) {
      age--
   }
   return age >= 0 ? String(age) : ""
}

const PersonalInformationEditForm = ({ data, userId, onSave, onCancel }: Props) => {
   const {
      control,
      handleSubmit,
      setValue,
      watch,
      formState: { errors }
   } = useForm<
      PersonalInformationFormValues,
      unknown,
      PersonalInformationUpdateInput
   >({
      resolver: zodResolver(personalInformationUpdateSchema),
      defaultValues: {
         phone: data.phone,
         birthdate: getDateInputValue(data.birthdate),
         country: data.country,
         countryCode: data.countryCode ?? "",
         state: data.state ?? "",
         stateCode: data.stateCode ?? "",
         city: data.city ?? "",
         cityGeonameId: data.cityGeonameId ?? 0
      }
   })
   const [country, countryCode, state, stateCode, city, cityGeonameId, birthdate] =
      watch([
         "country",
         "countryCode",
         "state",
         "stateCode",
         "city",
         "cityGeonameId",
         "birthdate"
      ])
   const location: LocationSelection = {
      countryCode,
      countryName: country,
      stateCode: stateCode ?? "",
      stateName: state ?? "",
      cityName: city,
      cityGeonameId:
         typeof cityGeonameId === "number" ? cityGeonameId || null : null
   }
   const [updatePersonalInformation, result] =
      useUpdateUserPersonalInformationMutation()
   const mutationState = getMutationState(result)
   const isLoading =
      getMutationPresentation(mutationState, { surface: "form" }).category === "loading"
   const onSubmit = async (values: PersonalInformationUpdateInput) => {
      try {
         await updatePersonalInformation({
            userId,
            data: values
         }).unwrap()
         onSave()
         await showAlert({
            type: "success",
            title: "Updated",
            text: "Personal information updated successfully."
         })
      } catch (error) {
         const errorPresentation = getMutationPresentation(
            getMutationErrorState(error),
            { surface: "form" }
         )
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Update failed",
            text: errorPresentation.message
         })
      }
   }

   const handleLocationChange = (value: LocationSelection) => {
      setValue("country", value.countryName, { shouldDirty: true, shouldValidate: true })
      setValue("countryCode", value.countryCode, {
         shouldDirty: true,
         shouldValidate: true
      })
      setValue("state", value.stateName, { shouldDirty: true, shouldValidate: true })
      setValue("stateCode", value.stateCode, {
         shouldDirty: true,
         shouldValidate: true
      })
      setValue("city", value.cityName, { shouldDirty: true, shouldValidate: true })
      setValue("cityGeonameId", value.cityGeonameId ?? 0, {
         shouldDirty: true,
         shouldValidate: true
      })
   }

   return (
      <form onSubmit={handleSubmit(onSubmit)}>
         <DialogContent className="grid gap-4! pt-2!">
            <Controller
               name="phone"
               control={control}
               render={({ field }) => (
                  <TextField
                     {...field}
                     disabled={isLoading}
                     required
                     error={!!errors.phone}
                     helperText={errors.phone?.message}
                     label="Phone Number"
                  />
               )}
            />
            <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               <Controller
                  name="birthdate"
                  control={control}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        type="date"
                        disabled={isLoading}
                        required
                        error={!!errors.birthdate}
                        helperText={errors.birthdate?.message}
                        label="Date of Birth"
                        slotProps={{ inputLabel: { shrink: true } }}
                     />
                  )}
               />
               <TextField
                  disabled
                  value={calculateAge(birthdate)}
                  label="Age"
               />
            </Box>
            <CountryCitySelector
               required
               value={location}
               errors={
                  {
                     country:
                        errors.country?.message ?? errors.countryCode?.message,
                     city: errors.city?.message,
                     cityGeonameId: errors.cityGeonameId?.message
                  }
               }
               onChange={handleLocationChange}
            />
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
               {isLoading ? "Saving..." : "Save Changes"}
            </Button>
         </DialogActions>
      </form>
   )
}

export default PersonalInformationEditForm
