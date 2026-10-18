import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Box, Menu, MenuItem, Typography } from "@mui/material"

import DataTable from "@/components/common/DataTable"
import { getAdminCompanyJobsColumns } from "@/features/admin/columns/adminCompanyJobsColumns"
import type { CompanyJob, CompanyJobsPagination } from "@/types/JobsStep.types"
import { formatDate as formatDateValue } from "@/utils/formatDate"
import type { SemanticQueryState } from "@/utils/queryState"

type JobsTableProps = {
   jobs: CompanyJob[]
   isLoading: boolean
   isFetching: boolean
   pagination?: CompanyJobsPagination
   onPageChange: (page: number) => void
   queryState?: SemanticQueryState<unknown>
   onRetry?: () => void
}

const JobsTable = ({
   jobs,
   isLoading,
   isFetching,
   pagination,
   onPageChange,
   queryState,
   onRetry
}: JobsTableProps) => {
   const navigate = useNavigate()
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
   const [selectedJob, setSelectedJob] = useState<CompanyJob | null>(null)

   const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, job: CompanyJob) => {
      setAnchorEl(event.currentTarget)
      setSelectedJob(job)
   }

   const handleCloseMenu = () => {
      setAnchorEl(null)
      setSelectedJob(null)
   }

   const handleMenuNavigation = (tab?: "applications") => {
      if (!selectedJob) return
      navigate(
         `/admin/jobs/${selectedJob.id}/${selectedJob.slug}${tab ? `?tab=${tab}` : ""}`
      )
      handleCloseMenu()
   }

   const columns = getAdminCompanyJobsColumns({
      onView: job => navigate(`/admin/jobs/${job.id}/${job.slug}`),
      onOpenMenu: handleOpenMenu,
      formatDate: date => formatDateValue(date) || "—"
   })

   return (
      <>
         <DataTable
            rows={jobs}
            columns={columns}
            getRowKey={job => job.id}
            isLoading={isLoading}
            isFetching={isFetching}
            queryState={queryState}
            onRetry={onRetry}
            emptyState={
               <Box className="py-14 text-center">
                  <Typography className="text-muted text-sm! font-medium!">
                     No jobs found
                  </Typography>
               </Box>
            }
            pagination={pagination}
            onPageChange={onPageChange}
            itemLabel="jobs"
            loadingRows={6}
         />

         <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}>
            <MenuItem onClick={() => handleMenuNavigation()}>View Job</MenuItem>

            <MenuItem onClick={() => handleMenuNavigation("applications")}>
               View Applications
            </MenuItem>
         </Menu>
      </>
   )
}

export default JobsTable
