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
                     <Avatar className="h-17.5! w-17.5! bg-[#ffebff]! p-2! text-[#6C3CF0]!">
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
                        className="hover:text-mui-blue-800 text-mui-blue-600 underline"
                        to="/login">
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
                           error={Boolean(errors.firstName)}
                           fullWidth
                           helperText={errors.firstName?.message}
                           label="First Name"
                           slotProps={{
                              input: {
                                 startAdornment: <Person2OutlinedIcon className="mr-2" />
                              }
                           }}
                        />
                     )}
                  />

                  <Controller
                     name="lastName"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           error={Boolean(errors.lastName)}
                           fullWidth
                           helperText={errors.lastName?.message}
                           label="Last Name"
                           slotProps={{
                              input: {
                                 startAdornment: <Person2OutlinedIcon className="mr-2" />
                              }
                           }}
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
                           error={Boolean(errors.email)}
                           fullWidth
                           helperText={errors.email?.message}
                           label="Email"
                           slotProps={{
                              input: {
                                 startAdornment: <EmailOutlined className="mr-2" />
                              }
                           }}
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
                           error={Boolean(errors.password)}
                           fullWidth
                           helperText={errors.password?.message}
                           label="Password"
                           slotProps={{
                              input: {
                                 startAdornment: <LockOutlined className="mr-2" />
                              }
                           }}
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
                           error={Boolean(errors.confirmPassword)}
                           fullWidth
                           helperText={errors.confirmPassword?.message}
                           label="Confirm Password"
                           slotProps={{
                              input: {
                                 startAdornment: <LockOutlined className="mr-2" />
                              }
                           }}
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
                           error={Boolean(errors.phone)}
                           fullWidth
                           helperText={errors.phone?.message}
                           label="Phone"
                           slotProps={{
                              input: {
                                 startAdornment: <PhoneOutlined className="mr-2" />
                              }
                           }}
                        />
                     )}
                  />

                  <Box className="col-span-2">
                     <CountryCitySelector
                        value={locationSelection}
                        errors={{
                           country: errors.country?.message,
                           state: errors.state?.message,
                           city: errors.city?.message
                        }}
                        size="medium"
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
                           type="date"
                           error={Boolean(errors.birthdate)}
                           fullWidth
                           helperText={errors.birthdate?.message}
                           label="Birth Date"
                           size="medium"
                           slotProps={{
                              inputLabel: {
                                 shrink: true
                              }
                           }}
                           variant="outlined"
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
                        <CloudUploadOutlined className="text-[45px]! text-[#7c3aed]!" />

                        <Typography>Click to upload</Typography>

                        <Typography
                           color="textSecondary"
                           variant="body2">
                           JPG PNG up to 5MB
                        </Typography>

                        <input
                           type="file"
                           accept="image/*"
                           hidden
                           onChange={handleFileChange}
                        />
                     </label>
                  </Box>

                  <Box className="flex flex-col items-center justify-center">
                     <Avatar
                        className="h-30! w-30!"
                        src={avatarPreview ?? undefined}
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
                  type="submit"
                  //   sx={{
                  //      mt: 4,
                  //      height: 55,
                  //      borderRadius: 3,
                  //      background: "#6C3CF0",
                  //      fontSize: 18
                  //   }}
                  disabled={isLoading}
                  fullWidth
                  variant="contained">
                  {isLoading ? "Loading..." : "Create Account"}
               </Button>
            </form>
         </CustomCard>
      </Box>
   )
}
