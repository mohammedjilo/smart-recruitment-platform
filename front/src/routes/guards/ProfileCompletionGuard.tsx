import { Navigate, Outlet } from "react-router-dom"
import { Button, CircularProgress, Box, Typography } from "@mui/material"
import { useGetProfessionalProfileQuery } from "@/features/user/services/professionalProfileApiCalls"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
// import { useGetProfessionalProfileQuery } from "@/features/user/services/professionalProfileApiCalls"

export default function ProfileCompletionGuard() {
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const query = useGetProfessionalProfileQuery(userId ?? "", {
      skip: !userId
   })
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined

   if (queryPresentation.category === "loading") {
      return (
         <Box className="flex min-h-screen items-center justify-center">
            <CircularProgress />
         </Box>
      )
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "stale_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-screen flex-col items-center justify-center gap-3 p-6">
            <Typography className="text-sm! text-red-600!" role="alert" aria-live="assertive">
               {queryPresentation.message}
            </Typography>
            <Button
               onClick={() => void query.refetch()}
               className="normal-case!">
               Retry
            </Button>
         </Box>
      )
   }
   if (queryPresentation.category === "silent" || queryState.status === "idle")
      return null

   if (!response?.data.completion?.isCompleted) {
      return (
         <Navigate
            to="/profile/complete"
            replace
         />
      )
   }

   return <Outlet />
}
