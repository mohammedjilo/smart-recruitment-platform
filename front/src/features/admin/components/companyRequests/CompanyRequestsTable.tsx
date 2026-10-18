import { Box } from "@mui/material"
import DataTable from "@/components/common/DataTable"
import type { CompanyRequests } from "@/types/admin"
import { getCompanyRequestsColumns } from "@/features/admin/columns/companyRequestsColumns"
import type { SemanticQueryState } from "@/utils/queryState"

type CompanyRequestsTableProps = {
   companies: CompanyRequests[]
   onView: (company: CompanyRequests) => void
   onApprove: (company: CompanyRequests) => void
   onReject: (company: CompanyRequests) => void
   isUpdating?: boolean
   isFetching?: boolean
   queryState?: SemanticQueryState<unknown>
   onRetry?: () => void
}

const CompanyRequestsTable = ({
   companies,
   onView,
   onApprove,
   onReject,
   isUpdating = false,
   isFetching = false,
   queryState,
   onRetry
}: CompanyRequestsTableProps) => {
   const columns = getCompanyRequestsColumns({ onView, onApprove, onReject, isUpdating })

   return (
      <DataTable
         rows={companies}
         columns={columns}
         getRowKey={company => company.id}
         isFetching={isFetching}
         queryState={queryState}
         onRetry={onRetry}
         minWidth={1380}
         emptyState={
            <Box className="flex min-h-87.5 flex-col items-center justify-center">
               <Box className="text-content text-lg! font-semibold!">
                  No company requests found
               </Box>
               <Box className="text-muted mt-2! text-sm!">
                  The current request list is empty.
               </Box>
            </Box>
         }
      />
   )
}

export default CompanyRequestsTable
