import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material"
import { JOB_STATUS_TONE_MAP, getStatusClassName } from "@/utils/statusStyles"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined"
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"

import type { DataTableColumn } from "@/components/common/DataTable"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import type { GetCompanyJobsResult } from "@/types/company"
import { formatDate as formatDateValue } from "@/utils/formatDate"
import { formatJobDeadline, getJobDeadlineInfo } from "@/utils/jobDeadline"

type CompanyJobRow = GetCompanyJobsResult["data"][number]

const formatSalary = (salary: number | null) => {
   if (salary === null) return "—"

   return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
   }).format(salary)
}

const formatDate = (date: Date | string) => formatDateValue(date)

const getExperienceText = (experience: number) => {
   if (experience === 0) {
      return "Entry Level"
   }

   return `${experience}+ Years`
}

const JobActionsCell = ({
   job,
   onToggleJobStatus,
   isUpdating
}: {
   job: CompanyJobRow
   onToggleJobStatus: (job: CompanyJobRow) => Promise<void> | void
   isUpdating: boolean
}) => {
   const navigate = useNavigate()
   const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

   const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setMenuAnchor(event.currentTarget)
   }

   const handleMenuClose = () => {
      setMenuAnchor(null)
   }

   const handleToggleJobStatus = async () => {
      handleMenuClose()
      await onToggleJobStatus(job)
   }

   const isJobClosed = job.status === "CLOSED"
   const isJobDraft = job.status === "DRAFT"
   const isExpired = job.status === "EXPIRED"
   const showOpenAction = isJobClosed || isJobDraft || isExpired

   return (
      <>
         <Box className="flex items-center justify-center gap-1">
            <IconButton
               title="View Job"
               className="text-primary! hover:bg-primary-tint! flex h-8 w-8 items-center justify-center rounded-lg transition"
               onClick={() => navigate(`/company/jobs/${job.id}/${job.slug}`)}>
               <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <IconButton
               title="Edit Job"
               className="text-primary! hover:bg-primary-tint! hover:text-primary-dark! flex h-8 w-8 items-center justify-center rounded-lg transition"
               onClick={() => navigate(`/company/jobs/${job.id}/${job.slug}/edit`)}>
               <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <IconButton
               title="More"
               disabled={isUpdating}
               className="text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100"
               onClick={handleMenuOpen}>
               <MoreVertIcon sx={{ fontSize: 18 }} />
            </IconButton>
         </Box>

         <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
               paper: {
                  className: "!rounded-xl !border !border-border !shadow-lg"
               }
            }}>
            <MenuItem
               onClick={handleToggleJobStatus}
               disabled={isUpdating}
               className={
                  showOpenAction
                     ? "px-3! py-2! text-green-600!"
                     : "px-3! py-2! text-red-600!"
               }
               sx={{ display: "flex", alignItems: "center", gap: 1 }}>
               {showOpenAction ? (
                  <LockOpenOutlinedIcon sx={{ fontSize: 18 }} />
               ) : (
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
               )}
               <Box className="text-sm font-medium">
                  {isExpired ? "Reopen Job" : showOpenAction ? "Open Job" : "Close Job"}
               </Box>
            </MenuItem>
         </Menu>
      </>
   )
}

export const getCompanyJobsColumns = ({
   onToggleJobStatus,
   isUpdating = false
}: {
   onToggleJobStatus: (job: CompanyJobRow) => Promise<void> | void
   isUpdating?: boolean
}): DataTableColumn<CompanyJobRow>[] => [
   {
      id: "job-title",
      header: "Job Title",
      width: 320,
      render: job => (
         <Box className="max-w-65">
            <Typography className="line-clamp-1! text-left! text-sm! font-semibold!">
               {job.title}
            </Typography>

            <Typography
               className="mt-1! line-clamp-1! text-xs!"
               color="textSecondary">
               {job.description}
            </Typography>
         </Box>
      )
   },
   {
      id: "employment-type",
      header: "Employment Type",
      width: 160,
      render: job => <EmploymentTypeChip employmentType={job.employmentType} />
   },
   {
      id: "experience",
      header: "Experience",
      width: 120,
      render: job => (
         <Typography
            className="text-sm!"
            color="textSecondary">
            {getExperienceText(job.experienceRequired)}
         </Typography>
      )
   },
   {
      id: "salary",
      header: "Salary",
      width: 130,
      render: job => (
         <Typography
            className="text-sm!"
            color="textSecondary">
            {formatSalary(job.salary)}
         </Typography>
      )
   },
   {
      id: "status",
      header: "Status",
      width: 120,
      render: job => (
         <Box
            className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold ${getStatusClassName(job.status, JOB_STATUS_TONE_MAP)}`}>
            {job.status}
         </Box>
      )
   },
   {
      id: "deadline",
      header: "Deadline",
      width: 180,
      render: job => {
         const deadlineInfo = getJobDeadlineInfo(job.deadline)

         return (
            <Box className="flex items-start gap-2">
               <CalendarTodayOutlinedIcon
                  sx={{
                     fontSize: 15,
                     color: "#64748b",
                     marginTop: "2px"
                  }}
               />

               <Box>
                  <Typography
                     className="text-sm! whitespace-nowrap!"
                     color="textSecondary">
                     {formatJobDeadline(job.deadline)}
                  </Typography>

                  <Typography
                     className={`mt-1! text-sm! whitespace-nowrap! ${deadlineInfo.className}`}>
                     {deadlineInfo.text}
                  </Typography>
               </Box>
            </Box>
         )
      }
   },
   {
      id: "created-at",
      header: "Created At",
      width: 140,
      render: job => (
         <Typography
            className="text-sm!"
            color="textSecondary">
            {formatDate(job.createdAt)}
         </Typography>
      )
   },
   {
      id: "actions",
      header: "Actions",
      align: "center",
      width: 120,
      render: job => (
         <JobActionsCell
            job={job}
            onToggleJobStatus={onToggleJobStatus}
            isUpdating={isUpdating}
         />
      )
   }
]
