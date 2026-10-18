import type { ReactNode } from "react"

import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined"
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined"
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined"
import VideoCameraFrontOutlinedIcon from "@mui/icons-material/VideoCameraFrontOutlined"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlined"

import type { NotificationType } from "@/types/notification"

export const companyNotificationConfig: Record<
   NotificationType,
   {
      icon: ReactNode
      background: string
      color: string
      title: string
   }
> = {
   APPLICATION: {
      icon: <PeopleOutlineOutlinedIcon />,
      background: "#DCFCE7",
      color: "#16A34A",
      title: "New application"
   },

   MESSAGE: {
      icon: <MessageOutlinedIcon />,
      background: "#E0F2FE",
      color: "#0284C7",
      title: "New message"
   },

   INTERVIEW: {
      icon: <VideoCameraFrontOutlinedIcon />,
      background: "#EDE9FE",
      color: "#7C3AED",
      title: "Interview notification"
   },

   JOB: {
      icon: <WorkOutlineOutlinedIcon />,
      background: "#FEF3C7",
      color: "#D97706",
      title: "Job notification"
   },

   SYSTEM: {
      icon: <BusinessOutlinedIcon />,
      background: "#DBEAFE",
      color: "#2563EB",
      title: "Company notification"
   },

   SUPPORT: {
      icon: <SupportAgentOutlinedIcon />,
      background: "#E2E8F0",
      color: "#1E293B",
      title: "Support update"
   },

   COMPANY_REQUEST: {
      icon: <BusinessOutlinedIcon />,
      background: "#FEF3C7",
      color: "#B45309",
      title: "Company request update"
   }
}
