import { Box, Button, Typography } from "@mui/material"
import { useGetOperationsDashboardQuery } from "@/features/admin/services/adminApiCalls"
import { AdminStatsSkeleton } from "@/features/admin/components/AdminSkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

export default function OperationsDashboardPage() {
   const query = useGetOperationsDashboardQuery()
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const dashboard = response?.data

   if (queryPresentation.category === "loading") {
      return <AdminStatsSkeleton count={4} />
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-80 flex-col items-center justify-center gap-3">
            <Typography
               className="text-sm! text-red-500!"
               role="alert"
               aria-live="assertive">
               {queryPresentation.message}
            </Typography>
            <Button
               onClick={query.refetch}
               className="normal-case!">
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

   if (!dashboard) {
      return (
         <Typography className="text-sm! text-muted!">
            Operations dashboard data could not be determined.
         </Typography>
      )
   }

   const cards = [
      ["Users", dashboard.users],
      ["Companies", dashboard.companies],
      ["Jobs", dashboard.jobs],
      ["Applications", dashboard.applications]
   ]

   return (
      <Box className="space-y-5">
         {queryPresentation.category === "stale_error" && (
            <Box
               className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
               role="status"
               aria-live="polite">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button
                  onClick={query.refetch}
                  className="normal-case!">
                  Retry
               </Button>
            </Box>
         )}
         <Box>
            <Typography className="text-content! text-2xl! font-bold!">
               Operations Dashboard
            </Typography>
            <Typography className="text-muted! mt-1! text-sm!">
               Overview of platform operations.
            </Typography>
         </Box>
         <Box className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {cards.map(([label, value]) => (
               <Box
                  key={String(label)}
                  className="border-border bg-surface rounded-xl border p-4">
                  <Typography className="text-muted! text-xs!">{label}</Typography>
                  <Typography className="text-content! mt-2! text-2xl! font-bold!">
                     {value}
                  </Typography>
               </Box>
            ))}
         </Box>
      </Box>
   )
}
