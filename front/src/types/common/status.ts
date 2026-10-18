import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CloseIcon from "@mui/icons-material/Close"
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import type { SvgIconComponent } from "@mui/icons-material"
import type {
   ApplicationStatus,
   CompanyApprovalStatus,
   CompanyStatus,
   EmploymentType,
   JobStatus,
   UserRole,
   UserStatus
} from "./enums"

export type StatusTone =
   "success" | "warning" | "error" | "neutral" | "info" | "cyan" | "indigo"

export const statusToneStyles: Record<StatusTone, string> = {
   success: "bg-emerald-50! text-emerald-700!",
   warning: "bg-amber-50! text-amber-700!",
   error: "bg-red-50! text-red-600!",
   neutral: "bg-slate-100! text-slate-600!",
   info: "bg-blue-50! text-blue-700!",
   cyan: "bg-cyan-50! text-cyan-700!",
   indigo: "bg-indigo-50! text-indigo-700!"
} as const

export type StatusConfig = {
   label: string
   className: string
   tone: StatusTone
}

export type ApplicationStatusConfig = StatusConfig & {
   icon: SvgIconComponent
}

export const APPLICATION_STATUS_CONFIG: Record<
   ApplicationStatus,
   ApplicationStatusConfig
> = {
   PENDING: {
      label: "Pending",
      tone: "warning",
      className: statusToneStyles.warning,
      icon: PendingOutlinedIcon
   },
   REVIEWING: {
      label: "In Review",
      tone: "info",
      className: statusToneStyles.info,
      icon: CheckCircleIcon
   },
   SHORTLISTED: {
      label: "Shortlisted",
      tone: "cyan",
      className: statusToneStyles.cyan,
      icon: TrendingUpIcon
   },
   INTERVIEW: {
      label: "Interview",
      tone: "indigo",
      className: statusToneStyles.indigo,
      icon: CalendarTodayOutlinedIcon
   },
   ACCEPTED: {
      label: "Accepted",
      tone: "success",
      className: statusToneStyles.success,
      icon: AutoAwesomeIcon
   },
   REJECTED: {
      label: "Rejected",
      tone: "error",
      className: statusToneStyles.error,
      icon: CancelIcon
   },
   WITHDRAWN: {
      label: "Withdrawn",
      tone: "neutral",
      className: statusToneStyles.neutral,
      icon: CloseIcon
   }
}

export const JOB_STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
   OPEN: {
      label: "Open",
      tone: "success",
      className: statusToneStyles.success
   },
   CLOSED: {
      label: "Closed",
      tone: "neutral",
      className: statusToneStyles.neutral
   },
   DRAFT: { label: "Draft", tone: "warning", className: statusToneStyles.warning },
   EXPIRED: { label: "Expired", tone: "error", className: statusToneStyles.error }
}

export const EMPLOYMENT_TYPE_CONFIG: Record<EmploymentType, StatusConfig> = {
   FULL_TIME: {
      label: "FULL_TIME",
      className: "bg-[#e9f9f0]! text-[#22a15a]!",
      tone: "success"
   },
   PART_TIME: {
      label: "PART_TIME",
      className: "bg-[#f0f9ff]! text-[#1a8bcb]!",
      tone: "info"
   },
   CONTRACT: {
      label: "CONTRACT",
      className: "bg-[#fff5dc]! text-[#e99a00]!",
      tone: "warning"
   },
   INTERNSHIP: {
      label: "INTERNSHIP",
      className: "bg-[#e9f0ff]! text-[#245dcc]!",
      tone: "info"
   },
   FREELANCE: {
      label: "FREELANCE",
      className: "bg-[#f3eaff]! text-[#8246e6]!",
      tone: "info"
   },
   REMOTE: { label: "REMOTE", className: "bg-[#fce4ec]! text-[#d6336c]!", tone: "error" }
}

export const USER_STATUS_CONFIG: Record<UserStatus, StatusConfig> = {
   ACTIVE: {
      label: "Active",
      tone: "success",
      className: statusToneStyles.success
   },
   DEACTIVATED: {
      label: "Deactivated",
      tone: "neutral",
      className: statusToneStyles.neutral
   }
}

export const COMPANY_STATUS_CONFIG: Record<CompanyStatus, StatusConfig> = {
   ACTIVE: {
      label: "Active",
      tone: "success",
      className: statusToneStyles.success
   },
   DEACTIVATED: {
      label: "Deactivated",
      tone: "neutral",
      className: statusToneStyles.neutral
   }
}

export const COMPANY_APPROVAL_STATUS_CONFIG: Record<CompanyApprovalStatus, StatusConfig> =
   {
      PENDING: {
         label: "Pending",
         tone: "warning",
         className: statusToneStyles.warning
      },
      APPROVED: {
         label: "Approved",
         tone: "success",
         className: statusToneStyles.success
      },
      REJECTED: {
         label: "Rejected",
         tone: "error",
         className: statusToneStyles.error
      }
   }

export const USER_ROLE_CONFIG: Record<UserRole, StatusConfig> = {
   USER: { label: "User", tone: "info", className: statusToneStyles.info },
   ADMIN: { label: "Admin", tone: "info", className: statusToneStyles.info }
}
