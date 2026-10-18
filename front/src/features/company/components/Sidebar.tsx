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
import { Box, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
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
         onClick={onClick}
         className={`group! mt-1! min-h-8.5! rounded-lg! px-2! text-sm! transition-all! duration-200! ${
            active
               ? "bg-primary! hover:bg-primary-dark! text-white!"
               : "text-muted hover:bg-primary-tint hover:text-primary"
         } `}>
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
         navigate("/login", { replace: true })
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
         width={268}
         open={open}
         onClose={onClose}>
         <Box className="border-border bg-surface flex h-full min-h-0 w-67 flex-col border-r pt-2">
            {/* Logo */}
            <Box className="flex h-27 items-center px-8">
               <Box className="flex items-center gap-3">
                  {/* Logo */}
                  <Box className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl">
                     <BusinessRounded
                        sx={{
                           fontSize: 23,
                           color: "white"
                        }}
                     />
                  </Box>

                  <Box>
                     <h1 className="text-content text-[17px] leading-5 font-semibold">
                        {company?.companyName}
                     </h1>

                     <p className="text-muted mt-1 text-sm">Company Portal</p>
                  </Box>
               </Box>
            </Box>

            {/* Navigation */}
            <nav
               id="company-navigation"
               aria-label="Company navigation"
               className="min-h-0 flex-1 overflow-y-auto px-4">
               {/* Dashboard */}
               <Box className="mb-4">
                  <List className="space-y-1!">
                     <SidebarItem
                        label="Dashboard"
                        icon={<DashboardRounded fontSize="small" />}
                        active={isPathActive("/dashboard")}
                        onClick={() => handleNavigate("dashboard", "/dashboard")}
                     />
                  </List>
               </Box>

               {/* Jobs */}
               <Box className="mb-4">
                  <p className="text-muted mb-3 px-4 text-[12px] font-medium tracking-wide uppercase">
                     Jobs
                  </p>

                  <List className="space-y-1!">
                     <SidebarItem
                        label="My Jobs"
                        icon={<WorkOutlineRounded fontSize="small" />}
                        active={isPathActive("/company/jobs")}
                        onClick={() => handleNavigate("jobs", "/company/jobs")}
                     />

                     <SidebarItem
                        label="Create Job"
                        icon={<AddRounded fontSize="small" />}
                        active={isPathActive("/create-job")}
                        onClick={() => handleNavigate("create-job", "/create-job")}
                     />
                  </List>
               </Box>

               {/* Applications */}
               <Box className="mb-4">
                  <p className="text-muted mb-3 px-4 text-[12px] font-medium tracking-wide uppercase">
                     Applications
                  </p>

                  <List className="space-y-1!">
                     <SidebarItem
                        label="Applications"
                        icon={<PeopleOutlineRounded fontSize="small" />}
                        active={isPathActive("/company/applications")}
                        onClick={() =>
                           handleNavigate("applications", "/company/applications")
                        }
                     />
                  </List>
               </Box>
               {/* Users */}
               <Box className="mb-4">
                  <p className="text-muted mb-3 px-4 text-[12px] font-medium tracking-wide uppercase">
                     Users
                  </p>

                  <List className="space-y-1!">
                     <SidebarItem
                        label="Users"
                        icon={<GroupsRounded fontSize="small" />}
                        active={isPathActive("/company/users")}
                        onClick={() => handleNavigate("users", "/company/users")}
                     />
                  </List>
               </Box>

               {/* Company */}
               <Box>
                  <p className="text-muted mb-3 px-4 text-[12px] font-medium tracking-wide uppercase">
                     Company
                  </p>

                  <List className="space-y-1">
                     <SidebarItem
                        label="Messages"
                        icon={<ChatBubbleOutlineRounded fontSize="small" />}
                        active={isPathActive("/company/messages")}
                        onClick={() => handleNavigate("messages", "/company/messages")}
                     />

                     <SidebarItem
                        label="Notifications"
                        icon={<NotificationsNoneOutlined fontSize="small" />}
                        active={isPathActive("/company/notifications")}
                        onClick={() =>
                           handleNavigate("notifications", "/company/notifications")
                        }
                     />

                     <SidebarItem
                        label="Company Profile"
                        icon={<BusinessRounded fontSize="small" />}
                        active={isPathActive("/company-profile")}
                        onClick={() =>
                           handleNavigate("company-profile", "/company-profile")
                        }
                     />

                     <SidebarItem
                        label="Support & Help"
                        icon={<ContactSupportOutlined fontSize="small" />}
                        active={isPathActive("/company/support")}
                        onClick={() => handleNavigate("support-help", "/company/support")}
                     />
                  </List>
               </Box>
            </nav>

            {/* Logout */}
            <Box className="border-border border-t p-4">
               <List className="space-y-1">
                  <SidebarItem
                     label="Logout"
                     icon={<LogoutRounded fontSize="small" />}
                     active={isPathActive("/login")}
                     onClick={handleLogout}
                  />
               </List>
            </Box>
         </Box>
      </ResponsiveSidebarDrawer>
   )
}

export default SideBar
