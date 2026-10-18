import { Box, Button, Typography } from "@mui/material"
import { useParams } from "react-router-dom"
import { useGetUserDetailsByAdminQuery } from "@/features/admin/services/adminApiCalls"
import UserDetailsHeader from "@/features/admin/components/userDetails/UserDetailsHeader"
import UserDetailsTabs from "@/features/admin/components/userDetails/UserDetailsTabs"
import { AdminUserDetailsSkeleton } from "@/features/admin/components/AdminSkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const UserDetailsPage = () => {
   const { id } = useParams<{ id: string }>()

   const query = useGetUserDetailsByAdminQuery(id ?? "", {
      skip: !id
   })
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   if (isLoading) {
      return <AdminUserDetailsSkeleton />
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
         <Box className="flex min-h-125 flex-col items-center justify-center gap-3 text-sm text-red-500">
            <Typography role="alert" aria-live="assertive">
               {queryPresentation.message}
            </Typography>
            <Button onClick={query.refetch} className="normal-case!">
               Retry
            </Button>
         </Box>
      )
   }

   if (!response?.data) {
      return (
         <Box className="flex min-h-125 items-center justify-center text-center text-sm text-muted">
            User details could not be determined.
         </Box>
      )
   }

   const { user, stats } = response.data

   return (
      <Box className="w-full space-y-6">
         {queryPresentation.category === "stale_error" && (
            <Box className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" role="status" aria-live="polite">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button onClick={query.refetch} className="normal-case!">
                  Retry
               </Button>
            </Box>
         )}
         <UserDetailsHeader user={user} />

         <UserDetailsTabs
            user={user}
            stats={stats}
         />
      </Box>
   )
}

export default UserDetailsPage
