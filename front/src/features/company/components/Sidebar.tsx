import React from "react"
import {
   DashboardRounded,
   WorkOutlineRounded,
   AddRounded,
   PeopleOutlineRounded,
   GroupsRounded,
   ChatBubbleOutlineRounded,
   BusinessRounded,
   LogoutRounded,
   NotificationsNoneOutlined,
   ContactSupportOutlined
} from "@mui/icons-material"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import {
   Box,
   List,
   ListItemButton,
   ListItemIcon,
   ListItemText,
   Typography
} from "@mui/material"
import ResponsiveSidebarDrawer from "@/components/common/ResponsiveSidebarDrawer"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuthLogOutMutation } from "@/features/auth/services/authApiCalls"
import { getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

interface SidebarItemProps {
   icon: React.ReactNode
   label: string
   active?: boolean
   onClick?: () => void
}

const SidebarItem = ({ icon, label, active = false, onClick }: SidebarItemProps) => {
   return (
      <ListItemButton
         className={`group! mt-1! min-h-8.5! rounded-lg! px-2! text-sm! transition-all! duration-200! ${
            active
               ? "bg-primary! hover:bg-primary-dark! text-white!"
               : "text-muted hover:bg-primary-tint hover:text-primary"
         } `}
         onClick={onClick}>
         <ListItemIcon className="text-inherit!">{icon}</ListItemIcon>
         <ListItemText primary={label} />
      </ListItemButton>
   )
}

interface SidebarProps {
   onNavigate?: (item: string) => void
   open: boolean
   onClose: () => void
}

const SideBar = ({ onNavigate, open, onClose }: SidebarProps) => {
   const navigate = useNavigate()
   const location = useLocation()
   const [authLogOut, logoutResult] = useAuthLogOutMutation()
   const logoutState = getMutationState(logoutResult)
   const logoutPresentation = getMutationPresentation(logoutState, { surface: "action" })

   const handleLogout = async () => {
      if (logoutPresentation.category === "loading") return
      try {
         await authLogOut(undefined).unwrap()
      } finally {
         onClose()
         navigate("/login", {
            replace: true,
            state: { explicitLogout: true }
         })
      }
   }

   const handleNavigate = (item: string, path: string) => {
      onNavigate?.(item)
      onClose()
      navigate(path)
   }

   const isPathActive = (path: string) => {
      const currentPath = location.pathname
      return currentPath === path || currentPath.startsWith(`${path}/`)
   }

   const company = useSelector((state: RootState) => state.auth.company)

   return (
      <ResponsiveSidebarDrawer
         open={open}
         width={268}
         onClose={onClose}>
         <Box className="border-border bg-surface flex h-full min-h-0 w-67 flex-col border-r pt-2">
            {/* Logo */}
            <Box className="flex h-27 items-center px-8">
               <Box className="flex items-center gap-3">
                  <Box className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl">
                     <BusinessRounded className="text-[23px]! text-white!" />
                  </Box>

                  <Box>
                     <Typography
                        className="text-content! text-[17px]! leading-5! font-semibold!"
                        variant="h1">
                        {company?.companyName}
                     </Typography>

                     <Typography
                        className="mt-1! text-sm!"
                        color="textSecondary">
                        Company Portal
                     </Typography>
                  </Box>
               </Box>
            </Box>

            {/* Navigation */}
            <nav
               className="min-h-0 flex-1 overflow-y-auto px-4"
               id="company-navigation"
               aria-label="Company navigation">
               {/* Dashboard */}
               <Box className="mb-4">
                  <List className="space-y-1!">
                     <SidebarItem
                        active={isPathActive("/dashboard")}
                        icon={<DashboardRounded fontSize="small" />}
                        label="Dashboard"
                        onClick={() => handleNavigate("dashboard", "/dashboard")}
                     />
                  </List>
               </Box>

               {/* Jobs */}
               <Box className="mb-4">
                  <Typography
                     className="mb-3! px-4! text-xs! font-medium! tracking-wide! uppercase!"
                     color="textSecondary">
                     Jobs
                  </Typography>

                  <List className="space-y-1!">
                     <SidebarItem
                        active={isPathActive("/company/jobs")}
                        icon={<WorkOutlineRounded fontSize="small" />}
                        label="My Jobs"
                        onClick={() => handleNavigate("jobs", "/company/jobs")}
                     />

                     <SidebarItem
                        active={isPathActive("/create-job")}
                        icon={<AddRounded fontSize="small" />}
                        label="Create Job"
                        onClick={() => handleNavigate("create-job", "/create-job")}
                     />
                  </List>
               </Box>

               {/* Applications */}
               <Box className="mb-4">
                  <Typography
                     className="mb-3! px-4! text-xs! font-medium! tracking-wide! uppercase!"
                     color="textSecondary">
                     Applications
                  </Typography>

                  <List className="space-y-1!">
                     <SidebarItem
                        active={isPathActive("/company/applications")}
                        icon={<PeopleOutlineRounded fontSize="small" />}
                        label="Applications"
                        onClick={() =>
                           handleNavigate("applications", "/company/applications")
                        }
                     />
                  </List>
               </Box>
               {/* Users */}
               <Box className="mb-4">
                  <Typography
                     className="mb-3! px-4! text-xs! font-medium! tracking-wide! uppercase!"
                     color="textSecondary">
                     Users
                  </Typography>

                  <List className="space-y-1!">
                     <SidebarItem
                        active={isPathActive("/company/users")}
                        icon={<GroupsRounded fontSize="small" />}
                        label="Users"
                        onClick={() => handleNavigate("users", "/company/users")}
                     />
                  </List>
               </Box>

               {/* Company */}
               <Box>
                  <Typography
                     className="mb-3! px-4! text-xs! font-medium! tracking-wide! uppercase!"
                     color="textSecondary">
                     Company
                  </Typography>

                  <List className="space-y-1">
                     <SidebarItem
                        active={isPathActive("/company/messages")}
                        icon={<ChatBubbleOutlineRounded fontSize="small" />}
                        label="Messages"
                        onClick={() => handleNavigate("messages", "/company/messages")}
                     />

                     <SidebarItem
                        active={isPathActive("/company/notifications")}
                        icon={<NotificationsNoneOutlined fontSize="small" />}
                        label="Notifications"
                        onClick={() =>
                           handleNavigate("notifications", "/company/notifications")
                        }
                     />

                     <SidebarItem
                        active={isPathActive("/company-profile")}
                        icon={<BusinessRounded fontSize="small" />}
                        label="Company Profile"
                        onClick={() =>
                           handleNavigate("company-profile", "/company-profile")
                        }
                     />

                     <SidebarItem
                        active={isPathActive("/company/support")}
                        icon={<ContactSupportOutlined fontSize="small" />}
                        label="Support & Help"
                        onClick={() => handleNavigate("support-help", "/company/support")}
                     />
                  </List>
               </Box>
            </nav>

            {/* Logout */}
            <Box className="border-border border-t p-4">
               <List className="space-y-1">
                  <SidebarItem
                     active={isPathActive("/login")}
                     icon={<LogoutRounded fontSize="small" />}
                     label="Logout"
                     onClick={handleLogout}
                  />
               </List>
            </Box>
         </Box>
      </ResponsiveSidebarDrawer>
   )
}

export default SideBar
