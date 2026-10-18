import { useState } from "react"
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import SupportChip from "@/features/support/components/SupportChip"
import PriorityChip from "@/features/support/components/PriorityChip"
import { formatCreatedAt } from "@/utils/formatDate"
import { useGetSupportOnlyTicketsQuery } from "@/services/api/supportOnlyApi"

const errorText = (error: unknown) => {
   if (typeof error === "object" && error !== null && "data" in error) {
      const data = error.data
      if (typeof data === "object" && data !== null && "error" in data) {
         const apiError = data.error
         if (
            typeof apiError === "object" &&
            apiError !== null &&
            "message" in apiError &&
            typeof apiError.message === "string"
         ) {
            return apiError.message
         }
      }
   }
   return "Support requests could not be loaded."
}

export default function SupportOnlyHomePage() {
   const [page, setPage] = useState(1)
   const tickets = useGetSupportOnlyTicketsQuery({ page, pageSize: 10 })
   const data = tickets.data?.data ?? []
   const meta = tickets.data?.meta

   return (
      <Box>
         <Box className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Box>
               <Typography
                  component="h2"
                  variant="h5"
                  className="text-content font-bold">
                  My Support Requests
               </Typography>
               <Typography className="text-muted mt-1 text-sm">
                  View requests associated with this account.
               </Typography>
            </Box>
            <Button
               component={Link}
               to="/support-only/requests/create"
               variant="contained"
               className="normal-case">
               Create request
            </Button>
         </Box>

         {tickets.isLoading ? (
            <Box className="flex justify-center py-16">
               <CircularProgress />
            </Box>
         ) : tickets.isError ? (
            <Alert
               severity="error"
               action={
                  <Button
                     color="inherit"
                     onClick={() => void tickets.refetch()}>
                     Retry
                  </Button>
               }>
               {errorText(tickets.error)}
            </Alert>
         ) : data.length === 0 ? (
            <Box className="bg-surface border-border rounded-xl border p-8 text-center">
               <Typography className="text-content font-semibold">
                  No support requests yet.
               </Typography>
               <Button
                  component={Link}
                  to="/support-only/requests/create"
                  variant="contained"
                  className="mt-4 normal-case">
                  Create a request
               </Button>
            </Box>
         ) : (
            <Box
               className="responsive-scroll-region bg-surface border-border overflow-x-auto rounded-xl border"
               role="region"
               aria-label="Support requests; scroll horizontally to see all columns"
               tabIndex={0}>
               <table className="w-full min-w-160 text-left">
                  <thead className="border-border border-b">
                     <tr className="text-muted text-xs uppercase">
                        <th className="px-4 py-3 font-medium">Subject</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Priority</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Updated</th>
                        <th className="px-4 py-3" />
                     </tr>
                  </thead>
                  <tbody>
                     {data.map(ticket => (
                        <tr
                           key={ticket.id}
                           className="border-border border-b last:border-0">
                           <td className="text-content px-4 py-4 text-sm font-medium">
                              {ticket.subject}
                           </td>
                           <td className="text-muted px-4 py-4 text-sm">
                              {ticket.category?.name ?? "General"}
                           </td>
                           <td className="px-4 py-4">
                              <PriorityChip priority={ticket.priority} />
                           </td>
                           <td className="px-4 py-4">
                              <SupportChip
                                 kind="status"
                                 value={ticket.status}
                              />
                           </td>
                           <td className="text-muted px-4 py-4 text-sm whitespace-nowrap">
                              {formatCreatedAt(ticket.updatedAt)}
                           </td>
                           <td className="px-4 py-4 text-right">
                              <Button
                                 component={Link}
                                 to={`/support-only/requests/${ticket.id}`}
                                 size="small"
                                 variant="outlined"
                                 className="normal-case">
                                 View
                              </Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {meta && meta.totalCount > meta.pageSize && (
                  <Box className="border-border flex items-center justify-between border-t px-4 py-3">
                     <Typography className="text-muted text-xs">
                        Page {meta.page} of {Math.ceil(meta.totalCount / meta.pageSize)}
                     </Typography>
                     <Box className="flex gap-2">
                        <Button
                           size="small"
                           disabled={page <= 1 || tickets.isFetching}
                           onClick={() => setPage(current => current - 1)}>
                           Previous
                        </Button>
                        <Button
                           size="small"
                           disabled={
                              page * meta.pageSize >= meta.totalCount ||
                              tickets.isFetching
                           }
                           onClick={() => setPage(current => current + 1)}>
                           Next
                        </Button>
                     </Box>
                  </Box>
               )}
            </Box>
         )}
      </Box>
   )
}
