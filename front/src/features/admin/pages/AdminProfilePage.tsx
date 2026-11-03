import { useEffect, useState } from "react"
import {
   Avatar,
   Box,
   Button,
   Card,
   CardContent,
   Divider,
   TextField,
   Typography
} from "@mui/material"
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { authActions } from "@/redux/slices/authSlice"
import {
   useGetAdminProfileQuery,
   useUpdateAdminProfileMutation,
   useUpdateAdminProfilePictureMutation
} from "@/features/admin/services/adminApiCalls"
import { showAlert } from "@/utils/swal"
import CountryCitySelector, {
   isLocationSelectionComplete,
   type LocationSelection
} from "@/components/common/CountryCitySelector"

const initialState = {
   firstName: "",
   lastName: "",
   phone: "",
   country: "",
   countryCode: "",
   state: "",
   stateCode: "",
   city: "",
   cityGeonameId: 0
}

export default function AdminProfilePage() {
   const dispatch = useDispatch()
   const user = useSelector((state: RootState) => state.auth.user)
   const { data, isLoading } = useGetAdminProfileQuery(undefined, {
      skip: !user || user.role !== "ADMIN"
   })
   const [updateAdminProfile, updateResult] = useUpdateAdminProfileMutation()
   const [uploadProfilePicture, uploadResult] = useUpdateAdminProfilePictureMutation()
   const [form, setForm] = useState(initialState)
   const [selectedFile, setSelectedFile] = useState<File | null>(null)
   const [previewUrl, setPreviewUrl] = useState<string | null>(null)
   const [locationChanged, setLocationChanged] = useState(false)

   useEffect(() => {
      if (!data?.data) return
      const {
         firstName,
         lastName,
         phone,
         country,
         countryCode,
         state,
         stateCode,
         city,
         cityGeonameId,
         profilePicUrl
      } = data.data
      setForm({
         firstName,
         lastName,
         phone,
         country,
         countryCode: countryCode ?? "",
         state: state ?? "",
         stateCode: stateCode ?? "",
         city: city ?? "",
         cityGeonameId: cityGeonameId ?? 0
      })
      setLocationChanged(false)
      setPreviewUrl(profilePicUrl ?? null)
   }, [data])

   useEffect(() => {
      if (!selectedFile) return
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreviewUrl(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
   }, [selectedFile])

   const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      setSelectedFile(file)
      event.target.value = ""
   }

   const handlePictureSave = async () => {
      if (!selectedFile) return
      try {
         const response = await uploadProfilePicture({ file: selectedFile }).unwrap()
         dispatch(
            authActions.updateUser({
               firstName: response.data.firstName,
               lastName: response.data.lastName,
               profilePicUrl: response.data.profilePicUrl ?? null
            })
         )
         setPreviewUrl(response.data.profilePicUrl ?? null)
         setSelectedFile(null)
         await showAlert({
            type: "success",
            title: "Profile picture updated",
            text: "Your admin profile photo has been updated."
         })
      } catch {
         await showAlert({
            type: "error",
            title: "Upload failed",
            text: "The profile photo could not be saved."
         })
      }
   }

   const isSaving = updateResult.isLoading || uploadResult.isLoading
   const location: LocationSelection = {
      countryCode: form.countryCode,
      countryName: form.country,
      stateCode: form.stateCode,
      stateName: form.state,
      cityName: form.city,
      cityGeonameId: form.cityGeonameId || null
   }
   const hasCompleteLocation = isLocationSelectionComplete(location)

   const handleSave = async () => {
      if (locationChanged && !hasCompleteLocation) return
      try {
         const response = await updateAdminProfile({
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            ...(locationChanged
               ? {
                    country: form.country,
                    countryCode: form.countryCode,
                    state: form.state,
                    stateCode: form.stateCode,
                    city: form.city,
                    cityGeonameId: form.cityGeonameId
                 }
               : {})
         }).unwrap()
         dispatch(
            authActions.updateUser({
               firstName: response.data.firstName,
               lastName: response.data.lastName,
               profilePicUrl: response.data.profilePicUrl ?? null
            })
         )
         setLocationChanged(false)
         await showAlert({
            type: "success",
            title: "Profile updated",
            text: "Your admin details were saved successfully."
         })
      } catch {
         await showAlert({
            type: "error",
            title: "Update failed",
            text: "Your profile could not be updated. Please try again."
         })
      }
   }

   return (
      <Box className="max-w-3xl space-y-6">
         <Card className="bg-surface border-border rounded-xl border">
            <CardContent className="space-y-6 p-6">
               <Box
                  sx={{
                     display: "flex",
                     flexDirection: { xs: "column", sm: "row" },
                     alignItems: "center",
                     gap: 3
                  }}>
                  <Avatar
                     src={previewUrl ?? undefined}
                     sx={{ width: 96, height: 96, fontSize: 30 }}>
                     {user
                        ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim() ||
                          "A"
                        : "A"}
                  </Avatar>

                  <Box className="flex flex-col items-center gap-2 sm:items-start">
                     <Button
                        className="normal-case!"
                        disabled={isSaving || isLoading}
                        component="label"
                        startIcon={<CloudUploadOutlinedIcon />}
                        variant="outlined">
                        Upload photo
                        <input
                           type="file"
                           accept="image/jpeg,image/png,image/gif,image/webp"
                           hidden
                           onChange={handlePictureChange}
                        />
                     </Button>
                     {selectedFile && (
                        <Button
                           className="normal-case!"
                           disabled={isSaving || isLoading}
                           variant="contained"
                           onClick={handlePictureSave}>
                           {uploadResult.isLoading ? "Saving photo..." : "Save photo"}
                        </Button>
                     )}
                     <Typography
                        className="mt-2! text-xs!"
                        color="textSecondary">
                        JPG, PNG, GIF or WEBP. Max size 5MB.
                     </Typography>
                  </Box>
               </Box>

               <Divider />

               <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                     value={form.firstName}
                     fullWidth
                     label="First name"
                     onChange={event =>
                        setForm(current => ({
                           ...current,
                           firstName: event.target.value
                        }))
                     }
                  />
                  <TextField
                     value={form.lastName}
                     fullWidth
                     label="Last name"
                     onChange={event =>
                        setForm(current => ({ ...current, lastName: event.target.value }))
                     }
                  />
                  <TextField
                     value={form.phone}
                     fullWidth
                     label="Phone"
                     onChange={event =>
                        setForm(current => ({ ...current, phone: event.target.value }))
                     }
                  />
                  <Box>
                     <CountryCitySelector
                        required={locationChanged}
                        value={location}
                        errors={
                           locationChanged && !hasCompleteLocation
                              ? !location.countryCode
                                 ? { country: "Select a country." }
                                 : { cityGeonameId: "Select a city from the list." }
                              : undefined
                        }
                        size="medium"
                        onChange={selection => {
                           setForm(current => ({
                              ...current,
                              country: selection.countryName,
                              countryCode: selection.countryCode,
                              state: selection.stateName,
                              stateCode: selection.stateCode,
                              city: selection.cityName,
                              cityGeonameId: selection.cityGeonameId ?? 0
                           }))
                           setLocationChanged(true)
                        }}
                     />
                  </Box>
               </Box>

               <Box className="flex justify-end">
                  <Button
                     className="normal-case!"
                     disabled={
                        isLoading || isSaving || (locationChanged && !hasCompleteLocation)
                     }
                     variant="contained"
                     onClick={handleSave}>
                     {updateResult.isLoading ? "Saving..." : "Save changes"}
                  </Button>
               </Box>
            </CardContent>
         </Card>
      </Box>
   )
}
