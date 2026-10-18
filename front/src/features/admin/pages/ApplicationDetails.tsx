import { useState } from "react"
import { Box, Button, Typography } from "@mui/material"
import { useGetApplicationDetailsByAdminQuery } from "@/features/admin/services/adminApiCalls"
import { AdminDetailsSkeleton } from "@/features/admin/components/AdminSkeletons"
import ApplicationDetailsHeader from "@/features/admin/components/applicationDetails/ApplicationDetailsHeader"
import ApplicationHero from "@/features/admin/components/applicationDetails/ApplicationHero"
import ApplicationOverview from "@/features/admin/components/applicationDetails/ApplicationOverviewStep/ApplicationOverview"
import ApplicationTabs from "@/features/admin/components/applicationDetails/ApplicationTabs"
import ProfileSnapshotStep from "@/features/admin/components/applicationDetails/profileSnapshotStep/ProfileSnapshotStep"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

type ApplicationDetailsProps = {
   applicationId: string
}

const ApplicationDetails = ({ applicationId }: ApplicationDetailsProps) => {
   const [activeTab, setActiveTab] = useState("overview")

   const query = useGetApplicationDetailsByAdminQuery(applicationId)
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   if (isLoading) {
      return <AdminDetailsSkeleton />
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-100 flex-col items-center justify-center gap-3">
            <Typography className="text-sm! text-red-600!" role="alert" aria-live="assertive">
               {queryPresentation.message}
            </Typography>
            <Button onClick={query.refetch} className="normal-case!">
               Retry
            </Button>
         </Box>
      )
   }

   if (
      (queryState.status === "aborted" && queryState.data === undefined) ||
      queryState.status === "idle" ||
      queryState.status === "inconsistent"
   ) {
      if (
         queryState.status === "idle" ||
         (queryState.status === "aborted" && queryState.data === undefined)
      ) {
         return null
      }
      return (
         <Box className="py-10 text-center text-sm text-muted">
            Application details could not be determined.
         </Box>
      )
   }

   if (!response?.data) return null
   const application = response.data

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
         <ApplicationDetailsHeader />

         <Box className="mt-5">
            <ApplicationHero application={application} />
         </Box>

         <Box className="mt-5">
            <ApplicationTabs
               activeTab={activeTab}
               onChange={setActiveTab}
            />
         </Box>

         {activeTab === "overview" && (
            <Box className="mt-5">
               <ApplicationOverview application={application} />
            </Box>
         )}

         {activeTab === "profile" && (
            <Box className="mt-5">
               <ProfileSnapshotStep applicationId={applicationId} />
            </Box>
         )}
      </Box>
   )
}

export default ApplicationDetails
