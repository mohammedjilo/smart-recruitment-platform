import { Avatar, Box, Button, LinearProgress, Typography } from "@mui/material"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import DataTable from "@/components/common/DataTable"
import type { DataTableColumn, DataTablePagination } from "@/components/common/DataTable"
import ApplicationStatusChip from "@/components/common/ApplicationStatusChip"
import type { JobApplication } from "@/types/admin"
import { getInitials } from "@/utils/string/getInitials"
import { formatDate as formatDateValue } from "@/utils/formatDate"
import { useNavigate } from "react-router-dom"
import type { SemanticQueryState } from "@/utils/queryState"
import { getMatchScoreColor } from "@/theme/tokens"

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

   const columns: DataTableColumn<JobApplication>[] = [
      {
         id: "candidate",
         header: "Candidate",
         render: application => {
            const fullName =
               `${application.user.firstName} ${application.user.lastName}`.trim()

            return (
               <Box className="flex items-center gap-3">
                  <Avatar className="bg-primary/10 text-primary h-9 w-9 text-xs font-bold">
                     {getInitials(fullName)}
                  </Avatar>
                  <Box>
                     <Typography className="text-sm! font-semibold!">
                        {fullName}
                     </Typography>
                     <Typography
                        className="mt-0.5! text-xs!"
                        color="textSecondary">
                        {application.user.email}
                     </Typography>
                  </Box>
               </Box>
            )
         }
      },
      {
         id: "match-score",
         header: "Match Score",
         render: application =>
            application.matchScore === null ? (
               <Typography className="text-sm! text-muted">—</Typography>
            ) : (
               <Box className="flex min-w-37.5 items-center gap-3">
                  <Typography className="w-10 text-xs font-bold text-content">
                     {application.matchScore}%
                  </Typography>
                  <LinearProgress
                     variant="determinate"
                     value={application.matchScore}
                     sx={{
                        "& .MuiLinearProgress-bar": {
                           backgroundColor: getMatchScoreColor(application.matchScore)
                        }
                     }}
                     className="h-1.5 flex-1 rounded-full"
                  />
               </Box>
            )
      },
      {
         id: "experience",
         header: "Experience",
         render: application => (
            <Typography className="text-sm! text-muted">
               {application.experience !== null
                  ? `${application.experience} years`
                  : "—"}
            </Typography>
         )
      },
      {
         id: "status",
         header: "Status",
         render: application => <ApplicationStatusChip status={application.status} />
      },
      {
         id: "applied-on",
         header: "Applied On",
         render: application => (
            <Box>
               <Typography className="text-sm!">
                  {formatDateValue(application.createdAt)}
               </Typography>
               <Typography
                  className="mt-0.5 text-xs!"
                  color="textSecondary">
                  {formatDateValue(application.createdAt, { format: "time" })}
               </Typography>
            </Box>
         )
      },
      {
         id: "actions",
         header: "Actions",
         align: "right",
         render: application => (
            <Button
               size="small"
               variant="text"
               color="primary"
               startIcon={<VisibilityOutlinedIcon />}
               onClick={() => navigate(`/admin/applications/${application.id}`)}
               className="min-w-22! rounded-lg! text-xs! font-medium! normal-case!">
               View
            </Button>
         )
      }
   ]

   return (
      <DataTable
         rows={applications}
         columns={columns}
         getRowKey={application => application.id}
         isLoading={isLoading}
         isFetching={isFetching}
         queryState={queryState}
         onRetry={onRetry}
         loadingRows={6}
         minWidth={900}
         emptyState={
            <Box className="flex min-h-50 items-center justify-center py-20">
               <Typography className="text-sm! font-medium! text-muted">
                  No applications found.
               </Typography>
            </Box>
         }
         pagination={pagination}
         onPageChange={onPageChange}
         itemLabel="applications"
      />
   )
}

export default ApplicationsTable
