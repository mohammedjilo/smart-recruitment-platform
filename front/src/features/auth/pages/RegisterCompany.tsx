import { Controller, useForm } from "react-hook-form"

import { Avatar, Box, Button, TextField, Typography } from "@mui/material"

import {
   Apartment,
   Business,
   CloudUploadOutlined,
   EmailOutlined,
   Language,
   LockOutlined,
   PhoneOutlined
} from "@mui/icons-material"
import CustomCard from "@/components/common/CustomCard"
import { Link, useNavigate } from "react-router-dom"
import { registerCompanySchema, type RegisterCompanyFormValues } from "@/schema/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, type ChangeEvent } from "react"
import { useRegisterCompanyMutation } from "@/features/auth/services/authApiCalls"
import { showAlert } from "@/utils/swal"
import FormErrorAlert from "@/components/common/FormErrorAlert"
import { applyApiFieldErrors } from "@/utils/formErrors"
import { getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { useAppDispatch } from "@/redux/store"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { authActions } from "@/redux/slices/authSlice"
import CountryCitySelector, {
   emptyLocationSelection,
   type LocationSelection
} from "@/components/common/CountryCitySelector"

export default function RegisterCompany() {
   const navigate = useNavigate()
   const dispatch = useAppDispatch()
   const registrationReview = useSelector(
      (state: RootState) => state.auth.companyRegistrationReview
   )
   const isResubmission = registrationReview?.registrationStatus === "REJECTED"
   const [avatarFile, setAvatarFile] = useState<File | null>(null)
   const [avatarPreview, setAvatarPreview] = useState<string | null>(
      registrationReview?.company.logoUrl ?? null
   )
   const [locationSelection, setLocationSelection] = useState<LocationSelection>(() => {
      const company = registrationReview?.company
      if (company?.countryCode && company.country && company.city) {
         return {
            countryCode: company.countryCode,
            countryName: company.country,
            stateCode: company.stateCode ?? "",
            stateName: company.state ?? "",
            cityName: company.city,
            cityGeonameId: company.cityGeonameId ?? null
         }
      }
      return emptyLocationSelection
   })
   const {
      control,
      handleSubmit,
      setError,
      setValue,
      formState: { errors }
   } = useForm<RegisterCompanyFormValues>({
      resolver: zodResolver(registerCompanySchema),
      defaultValues: {
         companyName: isResubmission ? registrationReview.company.companyName : "",
         slug: isResubmission ? registrationReview.company.slug : "",
         description: isResubmission
            ? (registrationReview.company.description ?? "")
            : "",
         email: isResubmission ? registrationReview.company.email : "",
         phone: isResubmission ? registrationReview.company.phone : "",
         password: "",
         confirmPassword: "",
         website: isResubmission ? (registrationReview.company.website ?? "") : "",
         location: isResubmission ? (registrationReview.company.location ?? "") : "",
         country: isResubmission ? (registrationReview.company.country ?? "") : "",
         countryCode: isResubmission
            ? (registrationReview.company.countryCode ?? "")
            : "",
         state: isResubmission ? (registrationReview.company.state ?? "") : "",
         stateCode: isResubmission ? (registrationReview.company.stateCode ?? "") : "",
         city: isResubmission ? (registrationReview.company.city ?? "") : "",
         cityGeonameId: isResubmission
            ? (registrationReview.company.cityGeonameId ?? 0)
            : 0
      }
   })
   const [registerCompany, mutationResult] = useRegisterCompanyMutation()
   const mutationState = getMutationState(mutationResult)
   const mutationPresentation = getMutationPresentation(mutationState, {
      surface: "form"
   })
   const isLoading = mutationPresentation.category === "loading"
   const submitError =
      mutationPresentation.category === "field_error" ||
      mutationPresentation.category === "form_error" ||
      mutationPresentation.category === "authentication_notice" ||
      mutationPresentation.category === "access_denied" ||
      mutationPresentation.category === "resource_not_found"
         ? mutationPresentation.message
         : null
   const showLoginAction =
      mutationState.status === "error" &&
      ["COMPANY_REGISTRATION_PENDING", "COMPANY_ALREADY_REGISTERED"].includes(
         mutationState.error.code
      )
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
   const onSubmit = async (data: RegisterCompanyFormValues) => {
      if (!locationSelection.countryCode || !locationSelection.cityGeonameId) {
         setError("location", {
            type: "required",
            message: "Select a country and city"
         })
         return
      }

      try {
         const result = await registerCompany({
            ...data,
            role: "company",
            logo: avatarFile
         }).unwrap()
         if (result.data) {
            dispatch(authActions.setCompanyRegistrationReview(result.data))
         }
         showAlert({ type: "success", text: result.message })
         navigate("/company/registration/pending", { replace: true })
      } catch (error) {
         applyApiFieldErrors(error, setError)
      }
   }

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
                           bgcolor: "#eff6ff",
                           color: "#2563EB",
                           padding: 1
                        }}>
                        <Apartment className="h-full! w-full!" />
                     </Avatar>

                     <Typography className="text-3xl! font-bold!">
                        {isResubmission ? "Review & resubmit" : "Register your company"}
                     </Typography>

                     <Typography color="textSecondary">
                        {isResubmission
                           ? "Update your company information and submit it for review again."
                           : "Create your company account and find the best talent"}
                     </Typography>
                  </Box>

                  <Typography>
                     Already have an account?
                     <Link
                        to="/login"
                        className="hover:text-mui-blue-800 text-mui-blue-600 underline">
                        Login
                     </Link>
                  </Typography>
               </Box>

               <FormErrorAlert message={submitError} />
               {showLoginAction && (
                  <Button
                     component={Link}
                     to="/login"
                     variant="outlined"
                     className="mt-2!">
                     Back to Login
                  </Button>
               )}

               {/* Company Name */}

               <Box>
                  <Controller
                     name="companyName"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           className="my-5!"
                           {...field}
                           fullWidth
                           label="Company Name"
                           slotProps={{
                              input: {
                                 startAdornment: <Business className="mr-2" />
                              }
                           }}
                           error={Boolean(errors.companyName)}
                           helperText={errors.companyName?.message}
                        />
                     )}
                  />
               </Box>

               <Box>
                  <Controller
                     name="slug"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           className="my-5!"
                           {...field}
                           fullWidth
                           label="Company Slug"
                           placeholder="acme-technology"
                           error={Boolean(errors.slug)}
                           helperText={errors.slug?.message}
                        />
                     )}
                  />
               </Box>

               {/* Description */}

               <Box>
                  <Controller
                     name="description"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           multiline
                           rows={4}
                           fullWidth
                           label="Description (Optional)"
                           placeholder="Tell us about your company, what you do, and your mission..."
                           slotProps={{
                              inputLabel: {
                                 shrink: true
                              }
                           }}
                           error={Boolean(errors.description)}
                           helperText={errors.description?.message}
                        />
                     )}
                  />
               </Box>

               {/* Upload */}

               <Box className="mt-6 grid grid-cols-3 gap-6">
                  <label className="hover:bg-mui-blue-100 col-span-2 flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed">
                     <CloudUploadOutlined
                        sx={{
                           fontSize: 45,
                           color: "#2563EB"
                        }}
                     />

                     <Typography>Upload company logo</Typography>

                     <Typography
                        variant="body2"
                        color="textSecondary">
                        JPG, PNG up to 5MB
                     </Typography>

                     <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handleFileChange}
                     />
                  </label>

                  <Box className="flex flex-col items-center justify-center rounded-xl">
                     <Avatar
                        src={avatarPreview ?? undefined}
                        sx={{
                           width: 100,
                           height: 100
                        }}
                     />
                  </Box>
               </Box>

               {/* Email & Phone */}

               <Box className="mt-6 grid grid-cols-2 gap-5">
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
                                 startAdornment: <EmailOutlined className="mr-2" />,
                                 readOnly: isResubmission
                              }
                           }}
                           error={Boolean(errors.email)}
                           helperText={errors.email?.message}
                        />
                     )}
                  />

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
               </Box>

               {/* Password */}

               <Box className="mt-5 grid grid-cols-2 gap-5">
                  <Controller
                     name="password"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           fullWidth
                           type="password"
                           label={isResubmission ? "Current password" : "Password"}
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
                           fullWidth
                           type="password"
                           label={
                              isResubmission
                                 ? "Confirm current password"
                                 : "Confirm Password"
                           }
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

               {/* Website */}

               <Box className="mt-5 grid grid-cols-2 gap-5">
                  <Controller
                     name="website"
                     control={control}
                     render={({ field }) => (
                        <TextField
                           {...field}
                           fullWidth
                           label="Website (Optional)"
                           slotProps={{
                              input: {
                                 startAdornment: <Language className="mr-2" />
                              }
                           }}
                           error={Boolean(errors.website)}
                           helperText={errors.website?.message}
                        />
                     )}
                  />

                  <Box className="col-span-2">
                     <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                           <CountryCitySelector
                              required
                              value={locationSelection}
                              errors={{
                                 country:
                                    errors.countryCode?.message ??
                                    errors.country?.message,
                                 state:
                                    errors.stateCode?.message ?? errors.state?.message,
                                 city:
                                    errors.city?.message ??
                                    errors.location?.message,
                                 cityGeonameId: errors.cityGeonameId?.message
                              }}
                              onChange={selection => {
                                 setLocationSelection(selection)
                                 const location = selection.cityName
                                    ? [
                                         selection.cityName,
                                         selection.stateName,
                                         selection.countryName
                                      ]
                                         .filter(Boolean)
                                         .join(", ")
                                    : ""
                                 field.onChange(location)
                                 setValue("location", location, {
                                    shouldValidate: true
                                 })
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
                                 setValue(
                                    "cityGeonameId",
                                    selection.cityGeonameId ?? 0,
                                    { shouldValidate: true }
                                 )
                              }}
                           />
                        )}
                     />
                     {errors.location?.message && (
                        <Typography
                           color="error"
                           variant="caption">
                           {errors.location.message}
                        </Typography>
                     )}
                  </Box>
               </Box>

               {/* Security Card */}

               <Box className="mt-6 flex gap-4 rounded-xl border bg-blue-50 p-5">
                  <Avatar
                     sx={{
                        bgcolor: "#2563EB"
                     }}>
                     ✓
                  </Avatar>

                  <Box>
                     <Typography>Secure & Verified</Typography>

                     <Typography
                        color="text.secondary"
                        variant="body2">
                        Your company information is secure and helps build trust with job
                        seekers.
                     </Typography>
                  </Box>
               </Box>

               {/* Button */}

               <Button
                  className="mt-2! capitalize!"
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isLoading}>
                  {isLoading
                     ? "Loading..."
                     : isResubmission
                       ? "Resubmit for Approval"
                       : "Create Company Account"}
               </Button>

               <Typography color="textSecondary">
                  By creating an account, you agree to our Terms of Service and Privacy
                  Policy.
               </Typography>
               <FormErrorAlert message={submitError} />
            </form>
         </CustomCard>
      </Box>
   )
}
