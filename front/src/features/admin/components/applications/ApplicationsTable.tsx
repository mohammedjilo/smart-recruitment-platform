import { Box } from "@mui/material"

import type { AdminApplication } from "@/types/admin"
import DataTable from "@/components/common/DataTable"
import { getAdminApplicationsColumns } from "@/features/admin/columns/applicationsColumns"
import { formatDate as formatDateValue } from "@/utils/formatDate"
import type { SemanticQueryState } from "@/utils/queryState"

type ApplicationsTableProps = {
   applications: AdminApplication[]
   onView: (applicationId: string) => void
   isLoading?: boolean
   isFetching?: boolean
   queryState?: SemanticQueryState<unknown>
   onRetry?: () => void
   pagination?: {
      totalCount: number
      page: number
      pageSize: number
   }
   onPageChange?: (page: number) => void
}

const ApplicationsTable = ({
   applications,
   onView,
   isLoading = false,
   isFetching = false,
   queryState,
   onRetry,
   pagination,
   onPageChange
}: ApplicationsTableProps) => {
   const formatDate = (date: string) => formatDateValue(date)
   const formatTime = (date: string) => formatDateValue(date, { format: "time" })

   const columns = getAdminApplicationsColumns({
      onView,
      formatDate,
      formatTime
   })

   return (
      <DataTable
         columns={columns}
         emptyState={
            <Box className="flex min-h-50 items-center justify-center py-20">
               <Box className="text-muted text-sm!">No applications found.</Box>
            </Box>
         }
         getRowKey={application => application.id}
         isFetching={isFetching}
         isLoading={isLoading}
         itemLabel="applications"
         pagination={pagination}
         queryState={queryState}
         rows={applications}
         onPageChange={onPageChange}
         onRetry={onRetry}
      />
   )
}

export default ApplicationsTable
