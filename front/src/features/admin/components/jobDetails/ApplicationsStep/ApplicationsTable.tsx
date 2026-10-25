import { Box, Typography } from "@mui/material"
import DataTable from "@/components/common/DataTable"
import type { DataTablePagination } from "@/components/common/DataTable"
import type { JobApplication } from "@/types/admin"
import { useNavigate } from "react-router-dom"
import type { SemanticQueryState } from "@/utils/queryState"
import { getJobApplicationsColumns } from "./columns"

type ApplicationsTableProps = {
   applications: JobApplication[]
   isLoading: boolean
   isFetching: boolean
   pagination?: DataTablePagination
   onPageChange: (page: number) => void
   queryState?: SemanticQueryState<unknown>
   onRetry?: () => void
}

const ApplicationsTable = ({
   applications,
   isLoading,
   isFetching,
   pagination,
   onPageChange,
   queryState,
   onRetry
}: ApplicationsTableProps) => {
   const navigate = useNavigate()
   const columns = getJobApplicationsColumns(applicationId =>
      navigate(`/admin/applications/${applicationId}`)
   )

   return (
      <DataTable
         columns={columns}
         emptyState={
            <Box className="flex min-h-50 items-center justify-center py-20">
               <Typography className="text-sm! font-medium! text-muted">
                  No applications found.
               </Typography>
            </Box>
         }
         getRowKey={application => application.id}
         isFetching={isFetching}
         isLoading={isLoading}
         itemLabel="applications"
         loadingRows={6}
         minWidth={900}
         pagination={pagination}
         queryState={queryState}
         rows={applications}
         onPageChange={onPageChange}
         onRetry={onRetry}
      />
   )
}

export default ApplicationsTable
