import {
   AttachMoneyOutlined,
   BusinessCenterOutlined,
   CalendarTodayOutlined,
   CheckCircleOutlined,
   GroupsOutlined,
   LocationOnOutlined,
   SendOutlined,
   Bookmark,
   BookmarkBorder
} from "@mui/icons-material"
import { Box, Button, Typography } from "@mui/material"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import type { JobDetails } from "@/types/api/jobs"
import { canAcceptApplications, formatJobDeadline } from "@/utils/jobDeadline"

type JobApplicationPanelProps = {
   job: JobDetails
   isSaving: boolean
   onApply: () => void
   onToggleSave: () => void
}

const formatSalary = (salary: number) =>
   new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
   }).format(salary)

type JobInfoRowProps = {
   icon: React.ReactElement
   label: string
   value: React.ReactNode
   danger?: boolean
   last?: boolean
}

const JobInfoRow = ({
   icon,
   label,
   value,
   danger = false,
   last = false
}: JobInfoRowProps) => (
   <Box
      className={`flex min-h-15.5 items-center gap-3 ${
         !last ? "border-b border-[#edf0f4]" : ""
      }`}>
      <Box className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f7f7fc] text-[#202a62]">
         {icon}
      </Box>
      <Typography className="text-sm!">{label}</Typography>
      <Typography
         className={`ml-auto! max-w-55! text-right! text-sm! font-medium! ${
            danger ? "text-red-500!" : ""
         }`}
         color="textSecondary">
         {value}
      </Typography>
   </Box>
)

const JobApplicationPanel = ({
   job,
   isSaving,
   onApply,
   onToggleSave
}: JobApplicationPanelProps) => {
   const salary = job.salary ? formatSalary(job.salary) : null
   const deadline = formatJobDeadline(job.deadline)
   const canApply = canAcceptApplications(job.status, job.deadline)
   const applyLabel = job.isApplied
      ? "Applied"
      : !canApply
        ? "Applications Closed"
        : job.hasWithdrawnApplication
          ? "Apply Again"
          : "Apply Now"

   return (
      <aside className="bg-surface self-start rounded-xl border border-[#e8eaf0] px-6 py-5 shadow-[0_2px_8px_rgba(20,30,60,0.035)]">
         <JobInfoRow
            icon={<GroupsOutlined sx={{ fontSize: 19 }} />}
            label="Experience Level"
            value={job.experienceRequired.toString()}
         />
         <JobInfoRow
            icon={<BusinessCenterOutlined sx={{ fontSize: 19 }} />}
            label="Employment Type"
            value={<EmploymentTypeChip employmentType={job.employmentType} />}
         />
         <JobInfoRow
            icon={<AttachMoneyOutlined sx={{ fontSize: 19 }} />}
            label="Salary"
            value={`${salary}`}
         />
         <JobInfoRow
            icon={<LocationOnOutlined sx={{ fontSize: 19 }} />}
            label="Location"
            value={job.company.location}
         />
         <JobInfoRow
            icon={<CalendarTodayOutlined sx={{ fontSize: 19 }} />}
            label="Deadline"
            value={deadline}
            danger
            last
         />

         <Button
            disabled={job.isApplied || !canApply}
            className={
               job.isApplied || !canApply
                  ? "mt-5! flex! h-14! w-full! items-center! justify-center! gap-3! rounded-lg! border border-[#b9edcf]! bg-[#ecfdf5]! text-[16px]! font-semibold! text-[#0f8f62]! capitalize! shadow-none! transition!"
                  : "app-button-primary mt-5! flex! h-14! w-full! items-center! justify-center! gap-3! rounded-lg! text-[16px]! font-semibold! capitalize! shadow-sm! transition! active:scale-[0.99]!"
            }
            onClick={() => canApply && !job.isApplied && onApply()}>
            {applyLabel}
            {job.isApplied ? (
               <CheckCircleOutlined sx={{ fontSize: 19 }} />
            ) : (
               <SendOutlined sx={{ fontSize: 19, transform: "rotate(-15deg)" }} />
            )}
         </Button>

         <Button
            className={
               job.isSaved
                  ? "app-button-secondary mt-3! flex! h-11! w-full! items-center! justify-center! gap-2! rounded-lg! text-sm! font-semibold! capitalize! shadow-none! transition!"
                  : "app-button-secondary mt-3! flex! h-11! w-full! items-center! justify-center! gap-2! rounded-lg! text-sm! font-medium! capitalize! transition!"
            }
            disabled={isSaving}
            onClick={onToggleSave}>
            {job.isSaved ? (
               <Bookmark sx={{ fontSize: 20 }} />
            ) : (
               <BookmarkBorder sx={{ fontSize: 20 }} />
            )}
            {job.isSaved ? "Saved Job" : "Save Job"}
         </Button>
      </aside>
   )
}

export default JobApplicationPanel
