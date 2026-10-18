import React from "react"

import { Box, Typography } from "@mui/material"

import DataTable from "@/components/common/DataTable"
import { getCompanyApplicationsColumns } from "@/features/company/columns/applicationsColumns"
import type { CompanyApplication } from "@/types/application"
import type { SemanticQueryState } from "@/utils/queryState"

interface ApplicationsTableProps {
   applications: CompanyApplication[]
   onViewApplication: (application: CompanyApplication) => void
   queryState?: SemanticQueryState<unknown>
   onRetry?: () => void
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
   applications,
   onViewApplication,
   queryState,
   onRetry
}) => {
   const emptyState = (
      <Box className="flex min-h-87.5 flex-col items-center justify-center">
         <Typography className="text-sm! font-medium! text-content">
            No applications found
         </Typography>

         <Typography className="mt-1! text-xs! text-muted">
            Try changing your search or status filter.
         </Typography>
      </Box>
   )

   return (
      <DataTable
         rows={applications}
         columns={getCompanyApplicationsColumns({ onViewApplication })}
         getRowKey={application => application.id}
         queryState={queryState}
         onRetry={onRetry}
         onRowClick={onViewApplication}
         emptyState={emptyState}
         minWidth={1000}
         containerClassName="shadow-none!"
      />
   )
}

export default ApplicationsTable
