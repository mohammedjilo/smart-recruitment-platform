import { Box, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import DataTable from "@/components/common/DataTable"
import {
   getSupportColumns,
   type SupportTableTicket
} from "@/features/admin/columns/supportColumns"
import type { SemanticQueryState } from "@/utils/queryState"

export type TableTicket = SupportTableTicket

type SupportTicketsTableProps = {
   tickets: TableTicket[]
   isLoading: boolean
   isFetching: boolean
   onRetry: () => void
   pagination?: {
      page: number
      pageSize: number
      totalCount: number
   }
   onPageChange: (page: number) => void
   queryState?: SemanticQueryState<unknown>
}

const SupportTicketsTable = ({
   tickets,
   isLoading,
   isFetching,
   onRetry,
   pagination,
   onPageChange,
   queryState
}: SupportTicketsTableProps) => {
   const navigate = useNavigate()

   return (
      <DataTable
         rows={tickets}
         columns={getSupportColumns(ticketId => navigate(`/admin/support/${ticketId}`))}
         getRowKey={ticket => ticket.id}
         isLoading={isLoading}
         isFetching={isFetching}
         queryState={queryState}
         onRetry={onRetry}
         pagination={pagination}
         onPageChange={onPageChange}
         itemLabel="tickets"
         emptyState={
            <Box className="p-10 text-center">
               <Typography className="text-sm! text-muted!">
                  No support requests found.
               </Typography>
            </Box>
         }
      />
   )
}

export default SupportTicketsTable
