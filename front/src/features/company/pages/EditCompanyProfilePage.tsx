import React, { useEffect, useMemo, useRef, useState } from "react"

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

      const optionalFields = {
         website: form.website,
         location: form.location,
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

   if (isLoading) {
      return (
         <div className="min-h-screen">
            <div className="mx-auto max-w-362.5">
               <EditCompanyProfileSkeleton />
            </div>
         </div>
      )
   }

   return (
      <div className="min-h-screen">
         <div className="mx-auto max-w-362.5">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
               <div>
                  <h1 className="text-[25px] font-semibold tracking-[-0.5px] text-[#172033]">
                     Edit Company Profile
                  </h1>

                  <p className="mt-1 text-[13px] text-muted">
                     Update your company information.
                  </p>
               </div>

               <EditProfileActions
                  isLoading={isUpdating}
                  disabled={!isChanged}
                  onCancel={handleCancel}
                  onSave={handleSubmit}
               />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
               {/* Left */}
               <div className="space-y-4">
                  <CompanyInformationForm
                     form={form}
                     onChange={updateField}
                  />

                  <AccountInformation company={company} />

                  <div className="rounded-2 border border-violet-100 bg-violet-50/60 px-4 py-3">
                     <p className="text-[11px] font-medium text-violet-700">
                        Changes you make will be reflected across your company profile and
                        job postings.
                     </p>
                  </div>
               </div>

               {/* Right */}
               <div className="space-y-4">
                  <CompanyLogoUpload
                     logoPreview={logoPreview}
                     onLogoChange={handleLogoChange}
                  />

                  <CompanyPreview
                     form={form}
                     logoPreview={logoPreview}
                  />
               </div>
            </div>
         </div>
      </div>
   )
}

export default EditCompanyProfilePage
