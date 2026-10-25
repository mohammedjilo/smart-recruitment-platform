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
                     <Avatar className="h-17.5! w-17.5! bg-[#eff6ff]! p-2! text-[#2563EB]!">
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
                        className="hover:text-mui-blue-800 text-mui-blue-600 underline"
                        to="/login">
                        Login
                     </Link>
                  </Typography>
               </Box>

               <FormErrorAlert message={submitError} />
               {showLoginAction && (
                  <Button
                     className="mt-2!"
                     component={Link}
                     to="/login"
                     variant="outlined">
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
                           error={Boolean(errors.companyName)}
                           fullWidth
                           helperText={errors.companyName?.message}
                           label="Company Name"
                           slotProps={{
                              input: {
                                 startAdornment: <Business className="mr-2" />
                              }
                           }}
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
                           placeholder="acme-technology"
                           error={Boolean(errors.slug)}
                           fullWidth
                           helperText={errors.slug?.message}
                           label="Company Slug"
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
                           placeholder="Tell us about your company, what you do, and your mission..."
                           error={Boolean(errors.description)}
                           fullWidth
                           helperText={errors.description?.message}
                           label="Description (Optional)"
                           multiline
                           rows={4}
                           slotProps={{
                              inputLabel: {
                                 shrink: true
                              }
                           }}
                        />
                     )}
                  />
               </Box>

               {/* Upload */}

               <Box className="mt-6 grid grid-cols-3 gap-6">
                  <label className="hover:bg-mui-blue-100 col-span-2 flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed">
                     <CloudUploadOutlined className="text-[45px]! text-[#2563EB]!" />

                     <Typography>Upload company logo</Typography>

                     <Typography
                        color="textSecondary"
                        variant="body2">
                        JPG, PNG up to 5MB
                     </Typography>

                     <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileChange}
                     />
                  </label>

                  <Box className="flex flex-col items-center justify-center rounded-xl">
                     <Avatar
                        className="h-25! w-25!"
                        src={avatarPreview ?? undefined}
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
                           error={Boolean(errors.email)}
                           fullWidth
                           helperText={errors.email?.message}
                           label="Email"
                           slotProps={{
                              input: {
                                 startAdornment: <EmailOutlined className="mr-2" />,
                                 readOnly: isResubmission
                              }
                           }}
                        />
                     )}
                  />

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
               </Box>

               {/* Password */}

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
                           label={isResubmission ? "Current password" : "Password"}
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
                           error={Boolean(errors.website)}
                           fullWidth
                           helperText={errors.website?.message}
                           label="Website (Optional)"
                           slotProps={{
                              input: {
                                 startAdornment: <Language className="mr-2" />
                              }
                           }}
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
                                 city: errors.city?.message ?? errors.location?.message,
                                 cityGeonameId: errors.cityGeonameId?.message
                              }}
                              size="medium"
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
                                 setValue("cityGeonameId", selection.cityGeonameId ?? 0, {
                                    shouldValidate: true
                                 })
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
                  <Avatar className="bg-[#2563EB]!">✓</Avatar>

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
                  type="submit"
                  disabled={isLoading}
                  fullWidth
                  variant="contained">
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
