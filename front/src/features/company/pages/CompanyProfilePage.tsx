import { useNavigate } from "react-router-dom"

import { Box, Button, Typography } from "@mui/material"
import { useGetCompanyProfileQuery } from "@/features/company/services/companyApiCalls"
import CompanyProfileHeader from "@/features/company/components/CompanyProfile/CompanyProfileHeader"
import CompanyOverviewCard from "@/features/company/components/CompanyProfile/CompanyOverviewCard"
import AboutCompanyCard from "@/features/company/components/CompanyProfile/AboutCompanyCard"
import CompanyDetailsCard from "@/features/company/components/CompanyProfile/CompanyDetailsCard"
import CompanyLogoCard from "@/features/company/components/CompanyProfile/CompanyLogoCard"
import { CompanyProfileSkeleton } from "@/features/company/components/CompanySkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const CompanyProfilePage = () => {
   const navigate = useNavigate()

   const query = useGetCompanyProfileQuery()
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   if (isLoading) {
      return <CompanyProfileSkeleton />
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-125 items-center justify-center">
            <Box className="text-center">
               <Typography className="text-xl font-semibold text-content">
                  {queryPresentation.message}
               </Typography>

               <Typography
                  variant="body2"
                  className="mt-2 text-muted">
                  The company profile request failed.
               </Typography>
               <Button onClick={query.refetch} className="mt-3! normal-case!">
                  Retry
               </Button>
            </Box>
         </Box>
      )
   }
   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }
   if (!response?.data) {
      return (
         <Box className="py-10 text-center text-sm text-muted">
            Company profile could not be determined.
         </Box>
      )
   }

   const company = response.data

   const handleEditProfile = () => {
      navigate("/company/profile/edit")
   }

   return (
      <Box className="min-h-screen">
         {queryPresentation.category === "stale_error" && (
            <Box className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" role="status" aria-live="polite">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button onClick={query.refetch} className="normal-case!">
                  Retry
               </Button>
            </Box>
         )}
         <CompanyProfileHeader onEdit={handleEditProfile} />

         <Box className="space-y-5">
            {/* Top Profile Card */}
            <CompanyOverviewCard
               company={company}
               onEdit={handleEditProfile}
            />

            {/* Main Information */}
            <Box className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
               <AboutCompanyCard
                  company={company}
                  totalJobsPosted={company.stats.totalJobsPosted}
                  totalApplicationsReceived={company.stats.totalApplicationsReceived}
               />

               <CompanyDetailsCard company={company} />
            </Box>

            {/* Company Logo */}
            <CompanyLogoCard company={company} />
         </Box>
      </Box>
   )
}

export default CompanyProfilePage
