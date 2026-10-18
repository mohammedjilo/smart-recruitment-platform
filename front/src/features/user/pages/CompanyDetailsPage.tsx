import { useState } from "react"
import { Navigate, useParams } from "react-router-dom"

import { Box, Button, Typography } from "@mui/material"

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"
import { useGetCompanyDetailsForUserQuery } from "@/features/user/services/userApiCalls"
import CompanyBreadcrumb from "@/features/user/components/companyDetails/CompanyBreadcrumb"
import CompanyDetailsHeader from "@/features/user/components/companyDetails/CompanyDetailsHeader"
import CompanyTabs from "@/features/user/components/companyDetails/CompanyTabs"
import AboutCompany from "@/features/user/components/companyDetails/AboutCompany"
import CompanyInformation from "@/features/user/components/companyDetails/CompanyInformation"
import AccountApprovalInformation from "@/features/user/components/companyDetails/AccountApprovalInformation"
import CompanyStats from "@/features/user/components/companyDetails/CompanyStats"
import JobsTap from "@/features/user/components/companyDetails/jobStep/JobsTap"
import { getUserCompanyDetailsPath } from "@/utils/companyRoutes"
import { UserCompanyDetailsSkeleton } from "@/features/user/components/UserSkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const CompanyDetailsPage = () => {
   const { id, slug } = useParams()

   const [activeTab, setActiveTab] = useState<"about" | "jobs">("about")

   const query = useGetCompanyDetailsForUserQuery(id ?? "", {
      skip: !id
   })
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   const company = response?.data.company
   const jobs = response?.data.jobs

   if (isLoading) {
      return <UserCompanyDetailsSkeleton />
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="border-border bg-surface flex min-h-125 flex-col items-center justify-center rounded-xl border px-6 text-center">
            <ErrorOutlineOutlinedIcon
               className="mb-3 text-red-400"
               sx={{ fontSize: 44 }}
            />

            <Typography className="text-content text-lg font-semibold">
               {queryPresentation.message}
            </Typography>

            <Typography
               className="mt-2 text-sm"
               color="textSecondary">
               The company details request failed.
            </Typography>
            <Button onClick={query.refetch} className="mt-3! normal-case!">
               Retry
            </Button>
         </Box>
      )
   }
   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }
   if (!company || !jobs) {
      return (
         <Box className="py-10 text-center text-sm text-muted">
            Company details could not be determined.
         </Box>
      )
   }

   const canonicalPath = getUserCompanyDetailsPath(company.id, company.slug)
   const requestedSlug =
      typeof slug === "string" && slug.trim().length > 0 ? slug : company.slug
   const requestedPath = getUserCompanyDetailsPath(company.id, requestedSlug)

   if (requestedPath !== canonicalPath) {
      return (
         <Navigate
            to={canonicalPath}
            replace
         />
      )
   }

   return (
      <Box className="w-full">
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
         <CompanyBreadcrumb />

         <CompanyDetailsHeader company={company} />

         <CompanyTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
         />

         {activeTab === "about" && (
            <Box className="grid grid-cols-1 gap-5 xl:grid-cols-12">
               <Box className="xl:col-span-5">
                  <AboutCompany description={company.description} />
               </Box>

               <Box className="xl:col-span-7">
                  <CompanyInformation company={company} />
               </Box>

               <Box className="xl:col-span-5">
                  <AccountApprovalInformation
                     status={company.status}
                     approvalStatus={company.approvalStatus}
                     createdAt={company.createdAt}
                     updatedAt={company.updatedAt}
                  />
               </Box>

               <Box className="xl:col-span-7">
                  <CompanyStats jobs={jobs} />
               </Box>
            </Box>
         )}

         {activeTab === "jobs" && <JobsTap companyId={company.id} />}
      </Box>
   )
}

export default CompanyDetailsPage
