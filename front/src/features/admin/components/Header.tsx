import { Menu as MenuIcon } from "@mui/icons-material"
import { AppBar, Avatar, Box, IconButton, Toolbar, Typography } from "@mui/material"

import { useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { getInitials } from "@/utils/string/getInitials"
import UserNotifications from "@/features/user/components/header/notifications/UserNotifications"

const pageTitles: Record<string, string> = {
   "/admin": "Dashboard",
   "/admin/company-requests": "Company Requests",
   "/admin/companies": "Companies",
   "/admin/users": "Users",
   "/admin/jobs": "Jobs",
   "/admin/applications": "Applications",
   "/admin/support": "Support Dashboard",
   "/admin/support/tickets": "Support",
   "/admin/admins": "Admin Management",
   "/admin/notifications": "Notifications",
   "/admin/settings": "Settings",
   "/admin/about": "Application & Employment Guide"
}

const pageDescriptions: Record<string, string> = {
   "/admin": "Overview of the platform",
   "/admin/company-requests": "Manage company registration requests",
   "/admin/companies": "Manage registered companies",
   "/admin/users": "Manage platform users",
   "/admin/jobs": "Manage job postings",
   "/admin/applications": "Manage job applications",
   "/admin/support": "Overview of support activity and ticket status",
   "/admin/support/tickets": "Manage support tickets and requests",
   "/admin/admins": "Manage administrator accounts, roles, and access",
   "/admin/notifications": "View platform notifications",
   "/admin/settings": "Manage your account and platform settings",
   "/admin/about": "Learn about application statuses and employment types"
}

const dynamicPages = [
   {
      pattern: /^\/admin\/companies\/[^/]+$/,
      title: "Company Details",
      description: "View company information and activity"
   },
   {
      pattern: /^\/admin\/users\/[^/]+$/,
      title: "User Details",
      description: "View user information and activity"
   },
   {
      pattern: /^\/admin\/jobs\/[^/]+\/[^/]+$/,
      title: "Job Details",
      description: "View job information and applications"
   },
   {
      pattern: /^\/admin\/applications\/[^/]+$/,
      title: "Application Details",
      description: "Review applicant and application information"
   }
]

interface AdminHeaderProps {
   sidebarOpen: boolean
   onMenuClick: () => void
}

export default function AdminHeader({ sidebarOpen, onMenuClick }: AdminHeaderProps) {
   const location = useLocation()
   const user = useSelector((state: RootState) => state.auth.user)
   const dynamicPage = dynamicPages.find(({ pattern }) => pattern.test(location.pathname))
   const isSupportTicketPage =
      location.pathname.startsWith("/admin/support/") &&
      location.pathname !== "/admin/support/tickets"

   const title =
      pageTitles[location.pathname] ??
      dynamicPage?.title ??
      (isSupportTicketPage ? "Support Ticket" : "Dashboard")

   const description =
      pageDescriptions[location.pathname] ??
      dynamicPage?.description ??
      (isSupportTicketPage
         ? "Review and manage this support ticket"
         : "Overview of the platform")
   const displayName = user ? `${user.firstName} ${user.lastName}` : ""
   const email = user?.email ?? ""
   const avatar = user?.profilePicUrl || undefined

   return (
      <AppBar
         className="sticky top-0 z-40 shadow"
         color="primary"
         position="sticky">
         <Toolbar className="justify-between">
            <Box className="flex min-w-0 items-center">
               <IconButton
                  className="lg:hidden!"
                  aria-controls="admin-navigation"
                  aria-expanded={sidebarOpen}
                  aria-label={
                     sidebarOpen ? "Close navigation menu" : "Open navigation menu"
                  }
                  color="inherit"
                  onClick={onMenuClick}>
                  <MenuIcon className="text-2xl!" />
               </IconButton>
               <Box className="ml-2 min-w-0">
                  <Typography className="text-lg! font-semibold!">{title}</Typography>
                  <Typography className="truncate text-xs!">{description}</Typography>
               </Box>
            </Box>
            <Box className="flex shrink-0 items-center">
               <UserNotifications />
               <Box className="ml-1 flex min-w-0 items-center">
                  <Avatar
                     alt={displayName}
                     src={avatar}>
                     {getInitials(displayName)}
                  </Avatar>
                  <Box className="ml-2 hidden min-w-0 flex-col sm:flex">
                     <Typography className="truncate text-sm!">{displayName}</Typography>
                     <Typography className="truncate text-xs!">{email}</Typography>
                  </Box>
               </Box>
            </Box>
         </Toolbar>
      </AppBar>
   )
}
