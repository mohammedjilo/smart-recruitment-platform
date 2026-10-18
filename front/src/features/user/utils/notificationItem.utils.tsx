import type { ReactNode } from "react"

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined"
import VideoCameraFrontOutlinedIcon from "@mui/icons-material/VideoCameraFrontOutlined"
import WorkOutlinedIcon from "@mui/icons-material/WorkOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"

import type { NotificationType } from "@/types/notification"

export const notificationIcons: Record<NotificationType, ReactNode> = {
   APPLICATION: <DescriptionOutlinedIcon />,
   MESSAGE: <MessageOutlinedIcon />,
   INTERVIEW: <VideoCameraFrontOutlinedIcon />,
   JOB: <WorkOutlinedIcon />,
   SYSTEM: <NotificationsNoneIcon />,
   SUPPORT: <SupportAgentOutlinedIcon />,
   COMPANY_REQUEST: <BusinessOutlinedIcon />
}

export const notificationColors: Record<NotificationType, string> = {
   APPLICATION: "bg-[#E8F1FF] text-[#2563EB]",
   MESSAGE: "bg-[#E8F8EF] text-[#16A34A]",
   INTERVIEW: "bg-[#F0E9FF] text-[#7C3AED]",
   JOB: "bg-[#FFF3E6] text-[#EA580C]",
   SYSTEM: "bg-[#FFE9ED] text-[#E11D48]",
   SUPPORT: "bg-[#E2E8F0] text-[#1E293B]",
   COMPANY_REQUEST: "bg-[#FEF3C7] text-[#B45309]"
}
