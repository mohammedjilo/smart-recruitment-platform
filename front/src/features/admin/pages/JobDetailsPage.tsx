import { useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { Box, Button, Typography } from "@mui/material"
import { useGetJobDetailsByAdminQuery } from "@/features/admin/services/adminApiCalls"
import { AdminDetailsSkeleton } from "@/features/admin/components/AdminSkeletons"
import JobDetailsHeader from "@/features/admin/components/jobDetails/JobDetailsHeader"
import JobHero from "@/features/admin/components/jobDetails/JobHero"
import JobTabs from "@/features/admin/components/jobDetails/JobTabs"
import OverviewStep from "@/features/admin/components/jobDetails/OverviewStep/OverviewStep"
import ApplicationQuestionsStep from "@/features/admin/components/jobDetails/ApplicationQuestionsStep/ApplicationQuestionsStep"
import ApplicationsStep from "@/features/admin/components/jobDetails/ApplicationsStep/ApplicationsStep"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const JobDetailsPage = () => {
   const [searchParams] = useSearchParams()
   const requestedTab = searchParams.get("tab")
   const [activeTab, setActiveTab] = useState(
      requestedTab === "applications" || requestedTab === "questions"
         ? requestedTab
         : "overview"
   )
   const { id, slug } = useParams<{ id: string; slug: string }>()

   const query = useGetJobDetailsByAdminQuery(id ?? "", {
      skip: !id || !slug
   })
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   if (isLoading) {
      return <AdminDetailsSkeleton />
   }
   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-100 flex-col items-center justify-center gap-3">
            <Typography
               className="text-sm! text-red-600!"
               aria-live="assertive"
               role="alert">
               {queryPresentation.message}
            </Typography>
            <Button
               className="normal-case!"
               onClick={query.refetch}>
               Retry
            </Button>
         </Box>
      )
   }

   if (!response?.data) {
      return (
         <Box className="flex min-h-100 items-center justify-center">
            <Typography className="text-sm!" color="textSecondary">
               Job details could not be determined.
            </Typography>
         </Box>
      )
   }

   const job = response.data

   return (
      <Box className="w-full">
         {queryPresentation.category === "stale_error" && (
            <Box
               className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
               aria-live="polite"
               role="status">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button
                  className="normal-case!"
                  onClick={query.refetch}>
                  Retry
               </Button>
            </Box>
         )}
         <JobDetailsHeader />

         <JobHero job={job} />

         <Box className="mt-5">
            <JobTabs
               activeTab={activeTab}
               applicationsCount={job._count.applications}
               onChange={setActiveTab}
            />

            {activeTab === "overview" && <OverviewStep job={job} />}

            {activeTab === "questions" && (
               <Box className="mt-5 rounded-xl p-6">
                  <ApplicationQuestionsStep jobId={id!} />
               </Box>
            )}

            {activeTab === "applications" && (
               <Box className="mt-5 p-6">
                  <ApplicationsStep jobId={id!} />
               </Box>
            )}
         </Box>
      </Box>
   )
}

export default JobDetailsPage
