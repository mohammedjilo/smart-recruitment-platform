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
      <Box className="contents">
         <Box className="flex items-center justify-center gap-1">
            <IconButton
               className="text-primary! hover:bg-primary-tint! flex h-8 w-8 items-center justify-center rounded-lg transition"
               title="View Job"
               onClick={() => navigate(`/company/jobs/${job.id}/${job.slug}`)}>
               <VisibilityOutlinedIcon className="text-lg!" />
            </IconButton>

            <IconButton
               className="text-primary! hover:bg-primary-tint! hover:text-primary-dark! flex h-8 w-8 items-center justify-center rounded-lg transition"
               title="Edit Job"
               onClick={() => navigate(`/company/jobs/${job.id}/${job.slug}/edit`)}>
               <EditOutlinedIcon className="text-lg!" />
            </IconButton>

            <IconButton
               className="text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100"
               disabled={isUpdating}
               title="More"
               onClick={handleMenuOpen}>
               <MoreVertIcon className="text-lg!" />
            </IconButton>
         </Box>

         <Menu
            anchorEl={menuAnchor}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            open={Boolean(menuAnchor)}
            slotProps={{
               paper: {
                  className: "!rounded-xl !border !border-border !shadow-lg"
               }
            }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            onClose={handleMenuClose}>
            <MenuItem
               className={`${
                  showOpenAction
                     ? "px-3! py-2! text-green-600!"
                     : "px-3! py-2! text-red-600!"
               } flex! items-center! gap-2!`}
               disabled={isUpdating}
               onClick={handleToggleJobStatus}>
               {showOpenAction ? (
                  <LockOpenOutlinedIcon className="text-lg!" />
               ) : (
                  <DeleteOutlineOutlinedIcon className="text-lg!" />
               )}
               <Box className="text-sm font-medium">
                  {isExpired ? "Reopen Job" : showOpenAction ? "Open Job" : "Close Job"}
               </Box>
            </MenuItem>
         </Menu>
      </Box>
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
               <CalendarTodayOutlinedIcon className="mt-0.5! text-[15px]! text-[#64748b]!" />

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
            isUpdating={isUpdating}
            job={job}
            onToggleJobStatus={onToggleJobStatus}
         />
      )
   }
]
