import { Box } from "@mui/material"

import type { AdminJob, AdminJobsPagination } from "@/types/admin"
import { useNavigate } from "react-router-dom"
import DataTable from "@/components/common/DataTable"
import { getAdminJobsColumns } from "@/features/admin/columns/jobsColumns"
import { formatDate as formatDateValue } from "@/utils/formatDate"
import type { SemanticQueryState } from "@/utils/queryState"

type JobsTableProps = {
   jobs: AdminJob[]

   isLoading: boolean
   isFetching: boolean
   queryState?: SemanticQueryState<unknown>
   onRetry?: () => void

   pagination?: AdminJobsPagination

   onPageChange: (page: number) => void
}

const formatDate = (date: string) => formatDateValue(date) || "—"

const JobsTable = ({
   jobs,
   isLoading,
   isFetching,
   queryState,
   onRetry,
   pagination,
   onPageChange
}: JobsTableProps) => {
   const navigate = useNavigate()

   const columns = getAdminJobsColumns({
      onView: job => navigate(`/admin/jobs/${job.id}/${job.slug}`),
      formatDate
   })

   return (
      <DataTable
         columns={columns}
         emptyState={
            <Box className="flex min-h-70 items-center justify-center">
               <Box className="text-sm! font-medium! text-muted">No jobs found</Box>
            </Box>
         }
         getRowKey={job => job.id}
         isFetching={isFetching}
         isLoading={isLoading}
         itemLabel="jobs"
         pagination={pagination}
         queryState={queryState}
         rows={jobs}
         onPageChange={onPageChange}
         onRetry={onRetry}
      />
   )
}

export default JobsTable
