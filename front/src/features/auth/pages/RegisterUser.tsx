import { useForm, Controller } from "react-hook-form"

import { TextField, Button, Avatar, Typography, Box } from "@mui/material"

import {
   EmailOutlined,
   LockOutlined,
   PhoneOutlined,
   CloudUploadOutlined
} from "@mui/icons-material"
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined"
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined"
import CustomCard from "@/components/common/CustomCard"
import { Link } from "react-router-dom"
import { useRegisterUserMutation } from "@/features/auth/services/authApiCalls"
import { registerUserSchema, type RegisterUserFormValues } from "@/schema/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState, type ChangeEvent } from "react"
import { showAlert } from "@/utils/swal"
import FormErrorAlert from "@/components/common/FormErrorAlert"
import { applyApiFieldErrors } from "@/utils/formErrors"
import { getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import CountryCitySelector, {
   emptyLocationSelection,
   type LocationSelection
} from "@/components/common/CountryCitySelector"

export default function RegisterUser() {
   const [avatarFile, setAvatarFile] = useState<File | null>(null)
   const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
   const [locationSelection, setLocationSelection] =
      useState<LocationSelection>(emptyLocationSelection)

   const {
      control,
      handleSubmit,
      setError,
      setValue,
      formState: { errors },
      reset
   } = useForm<RegisterUserFormValues>({
      resolver: zodResolver(registerUserSchema),
      defaultValues: {
         firstName: "",
         lastName: "",
         email: "",
         phone: "",
         country: "",
         countryCode: "",
         state: "",
         stateCode: "",
         city: "",
         cityGeonameId: 0,
         password: "",
         confirmPassword: "",
         birthdate: ""
      }
   })

   const [registerUser, mutationResult] = useRegisterUserMutation()
   const mutationState = getMutationState(mutationResult)
   const mutationPresentation = getMutationPresentation(mutationState, {
      surface: "form"
   })
   const isLoading = mutationPresentation.category === "loading"
   const data = mutationState.status === "success" ? mutationState.data : undefined
   const submitError =
      mutationPresentation.category === "field_error" ||
      mutationPresentation.category === "form_error" ||
      mutationPresentation.category === "authentication_notice" ||
      mutationPresentation.category === "access_denied" ||
      mutationPresentation.category === "resource_not_found"
         ? mutationPresentation.message
         : null
   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null
      setAvatarFile(file)
      if (file) {
         const reader = new FileReader()
         reader.onload = () => setAvatarPreview(String(reader.result))
         reader.readAsDataURL(file)
      } else {
         setAvatarPreview(null)
      }
   }
   const onSubmit = async (data: RegisterUserFormValues) => {
      // const formData = new FormData()

      // formData.append("firstName", data.firstName)
      // formData.append("lastName", data.lastName)
      // formData.append("email", data.email)
      // formData.append("password", data.password)
      // formData.append("phone", data.phone || "")
      // formData.append("country", data.country)
      // formData.append("role", "user")
      // if (avatarPreview) {
      //    const blob = dataURLtoBlob(avatarPreview)
      //    formData.append("image", blob, "profile.jpg")
      // }

      // await registerUser(formData)

      try {
         await registerUser({ ...data, role: "user", image: avatarFile }).unwrap()
      } catch (error) {
         applyApiFieldErrors(error, setError)
      }
   }
   useEffect(() => {
      if (mutationPresentation.category === "contextual_success") {
         showAlert({ type: "success", text: data?.message })
         reset()
         setLocationSelection(emptyLocationSelection)
         setAvatarFile(null)
         setAvatarPreview(null)
      }
   }, [mutationPresentation.category, data?.message, reset])
   return (
      <Box className="flex min-h-screen items-center justify-center py-6">
         <CustomCard>
            <form onSubmit={handleSubmit(onSubmit)}>
               {/* Header */}

               <Box className="flex justify-between">
                  <Box>
                     <Avatar
                        sx={{
                           width: 70,
                           height: 70,
                           bgcolor: "#ffebff",
                           color: "#6C3CF0",
                           padding: 1
                        }}>
                        <PersonAddAlt1OutlinedIcon className="h-full! w-full!" />
                     </Avatar>

                     <Typography className="text-3xl! font-bold!">
                        Create your account
                     </Typography>

                     <Typography color="textSecondary">
                        Join us and start your journey today
                     </Typography>
                  </Box>

                  <Typography>
                     Already have account?
                     <Link
                        to="/login"
                        className="hover:text-mui-blue-800 text-mui-blue-600 underline">
                        Login
                     </Link>
                  </Typography>
               </Box>

               <FormErrorAlert message={submitError} />

               {/* Inputs */}

               <Box className="mt-8 grid grid-cols-2 gap-5">
                  <Controller
                     name="firstName"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           fullWidth
                           label="First Name"
                           slotProps={{
                              input: {
                                 startAdornment: <Person2OutlinedIcon className="mr-2" />
                              }
                           }}
                           error={Boolean(errors.firstName)}
                           helperText={errors.firstName?.message}
                        />
                     )}
                  />

                  <Controller
                     name="lastName"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           fullWidth
                           label="Last Name"
                           slotProps={{
                              input: {
                                 startAdornment: <Person2OutlinedIcon className="mr-2" />
                              }
                           }}
                           error={Boolean(errors.lastName)}
                           helperText={errors.lastName?.message}
                        />
                     )}
                  />
               </Box>

               <Box className="mt-5">
                  <Controller
                     name="email"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           fullWidth
                           label="Email"
                           slotProps={{
                              input: {
                                 startAdornment: <EmailOutlined className="mr-2" />
                              }
                           }}
                           error={Boolean(errors.email)}
                           helperText={errors.email?.message}
                        />
                     )}
                  />
               </Box>

               <Box className="mt-5 grid grid-cols-2 gap-5">
                  <Controller
                     name="password"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           type="password"
                           fullWidth
                           label="Password"
                           slotProps={{
                              input: {
                                 startAdornment: <LockOutlined className="mr-2" />
                              }
                           }}
                           error={Boolean(errors.password)}
                           helperText={errors.password?.message}
                        />
                     )}
                  />

                  <Controller
                     name="confirmPassword"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           type="password"
                           fullWidth
                           label="Confirm Password"
                           slotProps={{
                              input: {
                                 startAdornment: <LockOutlined className="mr-2" />
                              }
                           }}
                           error={Boolean(errors.confirmPassword)}
                           helperText={errors.confirmPassword?.message}
                        />
                     )}
                  />
               </Box>

               <Box className="mt-5 grid grid-cols-2 gap-5">
                  <Controller
                     name="phone"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           fullWidth
                           label="Phone"
                           slotProps={{
                              input: {
                                 startAdornment: <PhoneOutlined className="mr-2" />
                              }
                           }}
                           error={Boolean(errors.phone)}
                           helperText={errors.phone?.message}
                        />
                     )}
                  />

                  <Box className="col-span-2">
                     <CountryCitySelector
                        required
                        value={locationSelection}
                        errors={{
                           country: errors.country?.message,
                           state: errors.state?.message,
                           city: errors.city?.message
                        }}
                        onChange={selection => {
                           setLocationSelection(selection)
                           setValue("country", selection.countryName, {
                              shouldValidate: true
                           })
                           setValue("countryCode", selection.countryCode, {
                              shouldValidate: true
                           })
                           setValue("state", selection.stateName, {
                              shouldValidate: true
                           })
                           setValue("stateCode", selection.stateCode, {
                              shouldValidate: true
                           })
                           setValue("city", selection.cityName, {
                              shouldValidate: true
                           })
                           setValue("cityGeonameId", selection.cityGeonameId ?? 0, {
                              shouldValidate: true
                           })
                        }}
                     />
                  </Box>
                  <Controller
                     name="birthdate"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           className="col-span-2"
                           {...field}
                           fullWidth
                           label="Birth Date"
                           type="date"
                           variant="outlined"
                           size="medium"
                           slotProps={{
                              inputLabel: {
                                 shrink: true
                              }
                           }}
                           error={Boolean(errors.birthdate)}
                           helperText={errors.birthdate?.message}
                        />
                     )}
                  />
               </Box>

               {/* Upload */}

               <Box className="mt-8 grid grid-cols-3 gap-5">
                  <Box className="col-span-2">
                     <Box className="flex">
                        <Typography>Profile Picture </Typography>
                        <Typography color="textSecondary">(Optinal)</Typography>
                     </Box>
                     <label className="hover:bg-mui-blue-100 flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed">
                        <CloudUploadOutlined
                           sx={{
                              fontSize: 45,
                              color: "#7c3aed"
                           }}
                        />

                        <Typography>Click to upload</Typography>

                        <Typography
                           variant="body2"
                           color="textSecondary">
                           JPG PNG up to 5MB
                        </Typography>

                        <input
                           hidden
                           accept="image/*"
                           type="file"
                           onChange={handleFileChange}
                        />
                     </label>
                  </Box>

                  <Box className="flex flex-col items-center justify-center">
                     <Avatar
                        src={avatarPreview ?? undefined}
                        sx={{
                           width: 120,
                           height: 120
                        }}
                     />

                     {/* <Button
                        className="mt-3! capitalize!"
                        variant="outlined">
                        Change
                     </Button> */}
                  </Box>
               </Box>

               <Typography
                  className="my-2!"
                  color="textSecondary">
                  By creating an account, you agree to our Terms of Service and Privacy
                  Policy.
               </Typography>

               <Button
                  className="capitalize!"
                  fullWidth
                  type="submit"
                  variant="contained"
                  //   sx={{
                  //      mt: 4,
                  //      height: 55,
                  //      borderRadius: 3,
                  //      background: "#6C3CF0",
                  //      fontSize: 18
                  //   }}
                  disabled={isLoading}>
                  {isLoading ? "Loading..." : "Create Account"}
               </Button>
            </form>
         </CustomCard>
      </Box>
   )
}
