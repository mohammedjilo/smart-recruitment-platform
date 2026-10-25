import { Box, Button, Typography } from "@mui/material"
import SupportChip from "@/features/shared/support/components/SupportChip"
import { useGetSupportDashboardQuery } from "@/services/shared/supportApiCalls"
import { AdminSupportDashboardSkeleton } from "@/features/admin/components/AdminSkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

export default function SupportDashboardPage() {
   const query = useGetSupportDashboardQuery()
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const dashboard = response?.data
   const isLoading = queryPresentation.category === "loading"

   if (isLoading) return <AdminSupportDashboardSkeleton />
   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-80 flex-col items-center justify-center gap-3">
            <Typography className="text-sm! text-red-600!" aria-live="assertive" role="alert">
               {queryPresentation.message}
            </Typography>
            <Button className="normal-case!" onClick={query.refetch}>
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
         <Typography className="text-sm!" color="textSecondary">
            Support dashboard data could not be determined.
         </Typography>
      )
   }

   const cards = [
      ["Open Tickets", dashboard.stats.open],
      ["In Progress", dashboard.stats.inProgress],
      ["Waiting for User", dashboard.stats.waitingForUser],
      ["Resolved", dashboard.stats.resolved],
      ["Assigned to Me", dashboard.stats.assignedToMe]
   ]

   return (
      <Box className="space-y-5">
         {queryPresentation.category === "stale_error" && (
            <Box className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" aria-live="polite" role="status">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button className="normal-case!" onClick={query.refetch}>
                  Retry
               </Button>
            </Box>
         )}
         <Box>
            <Typography className="text-content! text-2xl! font-bold!">
               Support Dashboard
            </Typography>
            <Typography className="mt-1! text-sm!" color="textSecondary">
               Support queue activity and ticket workload.
            </Typography>
         </Box>
         <Box className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {cards.map(([label, value]) => (
               <Box
                  className="border-border bg-surface rounded-xl border p-4"
                  key={String(label)}>
                  <Typography className="text-xs!" color="textSecondary">{label}</Typography>
                  <Typography className="text-content! mt-2! text-2xl! font-bold!">
                     {value}
                  </Typography>
               </Box>
            ))}
         </Box>
         <Box className="border-border bg-surface rounded-xl border p-5">
            <Typography className="text-content! text-base! font-bold!">
               Recent Support Tickets
            </Typography>
            <Box className="mt-4 space-y-3">
               {dashboard.recent.map(ticket => (
                  <Box
                     className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-0"
                     key={ticket.id}>
                     <Box>
                        <Typography className="text-content! text-sm! font-semibold!">
                           {ticket.subject}
                        </Typography>
                        <Typography className="text-xs!" color="textSecondary">
                           {ticket.category?.name ?? "General"}
                        </Typography>
                     </Box>
                     <SupportChip
                        value={ticket.status}
                        kind="status"
                     />
                  </Box>
               ))}
            </Box>
         </Box>
      </Box>
   )
}
