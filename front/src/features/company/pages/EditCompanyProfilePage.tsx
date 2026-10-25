import React, { useEffect, useMemo, useRef, useState } from "react"
import { Box, Typography } from "@mui/material"
import {
   emptyLocationSelection,
   isLocationSelectionComplete,
   type LocationSelection
} from "@/components/common/CountryCitySelector"

import {
   useGetCompanyProfileQuery,
   useUpdateCompanyProfileMutation
} from "@/features/company/services/companyApiCalls"
import { showAlert } from "@/utils/swal"
import EditProfileActions from "@/features/company/components/EditCompanyProfile/EditProfileActions"
import CompanyInformationForm from "@/features/company/components/EditCompanyProfile/CompanyInformationForm"
import AccountInformation from "@/features/company/components/EditCompanyProfile/AccountInformation"
import CompanyLogoUpload from "@/features/company/components/EditCompanyProfile/CompanyLogoUpload"
import CompanyPreview from "@/features/company/components/EditCompanyProfile/CompanyPreview"
import type { CompanyProfileFormValues } from "@/features/company/components/EditCompanyProfile/types"
import { EditCompanyProfileSkeleton } from "@/features/company/components/CompanySkeletons"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

const EditCompanyProfilePage: React.FC = () => {
   const { data, isLoading } = useGetCompanyProfileQuery()

   const [updateCompanyProfile, updateResult] = useUpdateCompanyProfileMutation()
   const updateState = getMutationState(updateResult)
   const updatePresentation = getMutationPresentation(updateState, { surface: "form" })
   const isUpdating = updatePresentation.category === "loading"

   const initialDataRef = useRef<CompanyProfileFormValues | null>(null)

   const [form, setForm] = useState<CompanyProfileFormValues>({
      companyName: "",
      email: "",
      phone: "",
      website: "",
      location: "",
      locationSelection: emptyLocationSelection,
      description: ""
   })

   const [logoFile, setLogoFile] = useState<File | null>(null)

   const [logoPreview, setLogoPreview] = useState<string | null>(null)

   const company = data?.data

   useEffect(() => {
      if (!company) return

      const initialValues: CompanyProfileFormValues = {
         companyName: company.companyName ?? "",
         email: company.email ?? "",
         phone: company.phone ?? "",
         website: company.website ?? "",
         location: company.location ?? "",
         locationSelection:
            company.countryCode && company.city && company.cityGeonameId
               ? {
                    countryCode: company.countryCode,
                    countryName: company.country ?? "",
                    stateCode: company.stateCode ?? "",
                    stateName: company.state ?? "",
                    cityName: company.city,
                    cityGeonameId: company.cityGeonameId
                 }
               : emptyLocationSelection,
         description: company.description ?? ""
      }

      setForm(initialValues)

      initialDataRef.current = initialValues

      setLogoPreview(company.logoUrl ?? null)
   }, [company])

   useEffect(() => {
      if (!logoFile) return

      const objectUrl = URL.createObjectURL(logoFile)

      setLogoPreview(objectUrl)

      return () => {
         URL.revokeObjectURL(objectUrl)
      }
   }, [logoFile])

   const updateField = <K extends keyof CompanyProfileFormValues>(
      field: K,
      value: CompanyProfileFormValues[K]
   ) => {
      setForm(previous => ({
         ...previous,
         [field]: value
      }))
   }

   const handleLocationChange = (locationSelection: LocationSelection) => {
      setForm(previous => ({
         ...previous,
         locationSelection,
         ...(isLocationSelectionComplete(locationSelection)
            ? {
                 location: [
                    locationSelection.cityName,
                    locationSelection.stateName,
                    locationSelection.countryName
                 ]
                    .filter(Boolean)
                    .join(", ")
              }
            : locationSelection.countryCode
              ? {}
              : { location: "" })
      }))
   }

   const handleLogoChange = (file: File | null) => {
      setLogoFile(file)
   }

   const handleCancel = () => {
      if (initialDataRef.current) {
         setForm(initialDataRef.current)
      }

      setLogoFile(null)

      setLogoPreview(company?.logoUrl ?? null)
   }

   const handleSubmit = async () => {
      const formData = new FormData()

      formData.append("companyName", form.companyName)

      formData.append("email", form.email)

      formData.append("phone", form.phone)

      const initialLocation = initialDataRef.current?.locationSelection
      const locationChanged =
         initialLocation !== undefined &&
         JSON.stringify(form.locationSelection) !== JSON.stringify(initialLocation)
      const hasLocationSelection = Boolean(
         form.locationSelection.countryCode ||
            form.locationSelection.cityName ||
            form.locationSelection.cityGeonameId
      )

      if (locationChanged && hasLocationSelection) {
         if (!isLocationSelectionComplete(form.locationSelection)) return
         formData.append("country", form.locationSelection.countryName)
         formData.append("countryCode", form.locationSelection.countryCode)
         formData.append("state", form.locationSelection.stateName)
         formData.append("stateCode", form.locationSelection.stateCode)
         formData.append("city", form.locationSelection.cityName)
         formData.append(
            "cityGeonameId",
            String(form.locationSelection.cityGeonameId)
         )
         formData.append("location", form.location)
      } else if (locationChanged) {
         formData.append("location", "")
      }

      const optionalFields = {
         website: form.website,
         description: form.description
      }

      Object.entries(optionalFields).forEach(([field, value]) => {
         const normalizedValue = value.trim()

         if (normalizedValue) {
            formData.append(field, normalizedValue)
         }
      })

      if (logoFile) {
         formData.append("logo", logoFile)
      }

      try {
         if (!company?.id) return
         await updateCompanyProfile({ companyId: company.id, formData }).unwrap()

         setLogoFile(null)

         initialDataRef.current = form

         if (
            getMutationPresentation(
               { status: "success" },
               { surface: "form" }
            ).category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: "Profile updated",
               text: "Company profile updated successfully."
            })
         }
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

   const isChanged = useMemo(() => {
      const initial = initialDataRef.current

      if (!initial) return false

      const formChanged = JSON.stringify(form) !== JSON.stringify(initial)

      return formChanged || Boolean(logoFile)
   }, [form, logoFile])
   const hasPartialLocation = Boolean(
      form.locationSelection.countryCode ||
         form.locationSelection.cityName ||
         form.locationSelection.cityGeonameId
   ) && !isLocationSelectionComplete(form.locationSelection)

   if (isLoading) {
      return (
         <Box className="min-h-screen">
            <Box className="mx-auto max-w-362.5">
               <EditCompanyProfileSkeleton />
            </Box>
         </Box>
      )
   }

   return (
      <Box className="min-h-screen">
         <Box className="mx-auto max-w-362.5">
            {/* Header */}
            <Box className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
               <Box>
                  <Typography
                     className="text-[25px]! font-semibold! tracking-[-0.5px]!"
                     variant="h1">
                     Edit Company Profile
                  </Typography>

                  <Typography className="mt-1! text-[13px]!" color="textSecondary">
                     Update your company information.
                  </Typography>
               </Box>

               <EditProfileActions
                  disabled={!isChanged || hasPartialLocation}
                  isLoading={isUpdating}
                  onCancel={handleCancel}
                  onSave={handleSubmit}
               />
            </Box>

            {/* Main Content */}
            <Box className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
               {/* Left */}
               <Box className="space-y-4">
                  <CompanyInformationForm
                     form={form}
                     onChange={updateField}
                     onLocationChange={handleLocationChange}
                  />

                  <AccountInformation company={company} />

                  <Box className="rounded-2 border border-violet-100 bg-violet-50/60 px-4 py-3">
                     <Typography className="text-[11px]! font-medium! text-violet-700!">
                        Changes you make will be reflected across your company profile and
                        job postings.
                     </Typography>
                  </Box>
               </Box>

               {/* Right */}
               <Box className="space-y-4">
                  <CompanyLogoUpload
                     logoPreview={logoPreview}
                     onLogoChange={handleLogoChange}
                  />

                  <CompanyPreview
                     form={form}
                     logoPreview={logoPreview}
                  />
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default EditCompanyProfilePage
