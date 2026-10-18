import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import CancelIcon from "@mui/icons-material/Cancel"
import CloseIcon from "@mui/icons-material/Close"
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined"
import type { ApplicationStatus } from "@/types/common/enums"
import { APPLICATION_STATUS_TONE_MAP, statusToneStyles } from "@/utils/statusStyles"

export type { ApplicationStatus } from "@/types/common/enums"

export const getStatusConfig = (status: ApplicationStatus) => {
   const className = statusToneStyles[APPLICATION_STATUS_TONE_MAP[status]]

   switch (status) {
      case "REVIEWING":
         return {
            label: "In Review",
            className,
            icon: <CheckCircleIcon fontSize="small" />
         }
      case "SHORTLISTED":
         return {
            label: "Shortlisted",
            className,
            icon: <TrendingUpIcon fontSize="small" />
         }
      case "INTERVIEW":
         return {
            label: "Interview",
            className,
            icon: <CalendarTodayOutlinedIcon fontSize="small" />
         }
      case "ACCEPTED":
         return {
            label: "Accepted",
            className,
            icon: <AutoAwesomeIcon fontSize="small" />
         }
      case "REJECTED":
         return {
            label: "Rejected",
            className,
            icon: <CancelIcon fontSize="small" />
         }
      case "WITHDRAWN":
         return {
            label: "Withdrawn",
            className,
            icon: <CloseIcon fontSize="small" />
         }
      case "PENDING":
      default:
         return {
            label: "Pending",
            className,
            icon: <PendingOutlinedIcon fontSize="small" />
         }
   }
}
