import {
   Dashboard as DashboardIcon,
   Business as BusinessIcon,
   People as PeopleIcon,
   WorkOutlined as WorkIcon,
   DescriptionOutlined as DescriptionIcon,
   MessageOutlined as MessageIcon,
   NotificationsNone as NotificationsIcon,
   InfoOutlined as InfoIcon,
   KeyboardArrowDown as KeyboardArrowDownIcon,
   LogoutOutlined as LogoutOutlinedIcon
} from "@mui/icons-material"
import {
   Avatar,
   Box,
   List,
   ListItemButton,
   ListItemIcon,
   ListItemText,
   Typography
} from "@mui/material"

import { useState } from "react"
import { useSelector } from "react-redux"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuthLogOutMutation } from "@/features/auth/services/authApiCalls"
import { useGetCurrentAdminPermissionsQuery } from "@/features/admin/services/adminApiCalls"
import { getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { usePermissions } from "@/features/admin/authorization/usePermissions"
import { ADMIN_PERMISSIONS, type AdminPermission } from "@/types/adminPermissions"
import type { RootState } from "@/redux/store"
import ResponsiveSidebarDrawer from "@/components/common/ResponsiveSidebarDrawer"
import { getInitials } from "@/utils/string/getInitials"

const managementLinks = [
   {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: DashboardIcon,
      permission: ADMIN_PERMISSIONS.VIEW_ADMIN_DASHBOARD
   },
   {
      label: "Support Dashboard",
      path: "/admin/support",
      icon: DashboardIcon,
      permission: ADMIN_PERMISSIONS.VIEW_SUPPORT_DASHBOARD,
      end: true
   },
   {
      label: "Company Requests",
      path: "/admin/company-requests",
      icon: BusinessIcon,
      permission: ADMIN_PERMISSIONS.VIEW_COMPANIES
   },
   {
      label: "Companies",
      path: "/admin/companies",
      icon: BusinessIcon,
      permission: ADMIN_PERMISSIONS.VIEW_COMPANIES
   },
   {
      label: "Users",
      path: "/admin/users",
      icon: PeopleIcon,
      permission: ADMIN_PERMISSIONS.VIEW_USERS
   },
   {
      label: "Jobs",
      path: "/admin/jobs",
      icon: WorkIcon,
      permission: ADMIN_PERMISSIONS.VIEW_JOBS
   },
   {
      label: "Applications",
      path: "/admin/applications",
      icon: DescriptionIcon,
      permission: ADMIN_PERMISSIONS.VIEW_APPLICATIONS
   },
   {
      label: "Support",
      path: "/admin/support/tickets",
      icon: MessageIcon,
      permission: ADMIN_PERMISSIONS.VIEW_SUPPORT
   },
   {
      label: "Admin Management",
      path: "/admin/admins",
      icon: PeopleIcon,
      permission: ADMIN_PERMISSIONS.VIEW_ADMINS
   }
]

const communicationLinks = [
   {
      label: "Notifications",
      path: "/admin/notifications",
      icon: NotificationsIcon,
      requiresNotificationPermission: true
   }
]

const systemLinks = [
   // {
   //    label: "Settings",
   //    path: "/admin/settings",
   //    icon: SettingsIcon
   // },
   {
      label: "Application Guide",
      path: "/admin/about",
      icon: InfoIcon
   }
]

interface SidebarLinkProps {
   label: string
   path: string
   icon: React.ElementType
   permission?: AdminPermission
   end?: boolean
   onNavigate?: () => void
}

function SidebarLink({ label, path, icon: Icon, end, onNavigate }: SidebarLinkProps) {
   return (
      <NavLink
         className="block"
         end={end}
         to={path}
         onClick={onNavigate}>
         {({ isActive }) => (
            <ListItemButton
               className={`group! min-h-8.5! rounded-lg! px-2! text-sm! transition-all! duration-200! ${
                  isActive
                     ? "bg-primary! hover:bg-primary-dark! text-white!"
                     : "text-muted hover:bg-primary-tint hover:text-primary"
               }`}
               component="span">
               <ListItemIcon className="text-inherit!">
                  <Icon className="text-[21px]! text-inherit!" />
               </ListItemIcon>
               <ListItemText primary={label} />
            </ListItemButton>
         )}
      </NavLink>
   )
}

interface AdminSidebarProps {
   open: boolean
   onClose: () => void
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
   const navigate = useNavigate()
   const [authLogOut, logoutResult] = useAuthLogOutMutation()
   const logoutState = getMutationState(logoutResult)
   const logoutPresentation = getMutationPresentation(logoutState, { surface: "action" })
   const isLoggingOut = logoutPresentation.category === "loading"
   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
   const { hasPermission, hasAnyPermission } = usePermissions()
   const user = useSelector((state: RootState) => state.auth.user)
   const adminName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Admin"
   const { currentData: currentAdminData } = useGetCurrentAdminPermissionsQuery(
      user?.role === "ADMIN" ? user.id : "",
      { skip: user?.role !== "ADMIN" }
   )
   const adminRoleNames = currentAdminData?.data.adminRoleNames
   const roleLabel =
      adminRoleNames
         ?.map(roleName =>
            roleName
               .toLowerCase()
               .split("_")
               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
               .join(" ")
         )
         .join(", ") || "Admin"

   const handleLogout = async () => {
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

   return (
      <ResponsiveSidebarDrawer
         open={open}
         width={250}
         onClose={onClose}>
         <Box className="border-border bg-surface text-content flex h-full min-h-0 w-62.5 flex-col overflow-x-hidden border-r">
            {/* Logo */}
            <Box className="flex h-21.5 items-center border-b border-white/10 px-6">
               <Box className="flex items-center gap-3">
                  <Box className="bg-primary flex h-11 w-11 items-center justify-center rounded-xl">
                     <Box className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white">
                        <span className="text-sm font-bold">✓</span>
                     </Box>
                  </Box>

                  <Box>
                     <Typography className="text-lg! leading-tight! font-bold!">
                        SRP
                     </Typography>

                     <Typography className="text-xs!" color="textSecondary">Admin Panel</Typography>
                  </Box>
               </Box>
            </Box>

            {/* Navigation */}
            <Box
               className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6"
               id="admin-navigation"
               aria-label="Admin navigation"
               component="nav">
               {/* Management */}
               <Box className="mb-7">
                  <Typography className="mb-3! px-2! text-[11px]! font-semibold! tracking-wide!" color="textSecondary">
                     Management
                  </Typography>

                  <List className="space-y-1">
                     {managementLinks
                        .filter(
                           link => !link.permission || hasPermission(link.permission)
                        )
                        .map(link => (
                           <SidebarLink
                              key={link.path}
                              {...link}
                              onNavigate={onClose}
                           />
                        ))}
                  </List>
               </Box>

               {/* Communication */}
               <Box className="mb-7">
                  <Typography className="mb-3! px-2! text-[11px]! font-semibold! tracking-wide!" color="textSecondary">
                     Communication
                  </Typography>

                  <List className="space-y-1">
                     {communicationLinks
                        .filter(
                           link =>
                              !link.requiresNotificationPermission ||
                              hasAnyPermission([
                                 ADMIN_PERMISSIONS.VIEW_SUPPORT,
                                 ADMIN_PERMISSIONS.VIEW_SUPPORT_DASHBOARD,
                                 ADMIN_PERMISSIONS.VIEW_COMPANIES
                              ])
                        )
                        .map(link => (
                           <SidebarLink
                              key={link.path}
                              {...link}
                              onNavigate={onClose}
                           />
                        ))}
                  </List>
               </Box>

               {/* System */}
               <Box>
                  <Typography className="mb-3! px-2! text-[11px]! font-semibold! tracking-wide!" color="textSecondary">
                     System
                  </Typography>

                  <List className="space-y-1">
                     {systemLinks.map(link => (
                        <SidebarLink
                           key={link.path}
                           {...link}
                           onNavigate={onClose}
                        />
                     ))}
                  </List>
               </Box>
            </Box>

            {/* Admin Profile */}
            <Box className="border-border border-t p-4">
               <button
                  className="hover:bg-primary-tint flex w-full items-center gap-3 rounded-xl p-2 transition"
                  onClick={() => setIsProfileMenuOpen(prev => !prev)}>
                  <Avatar
                     className="h-10 w-10"
                     alt={adminName}
                     src={user?.profilePicUrl || undefined}>
                     {getInitials(adminName)}
                  </Avatar>

                  <Box className="min-w-0 flex-1 text-left">
                     <Typography className="text-content! truncate! text-sm! font-semibold!">
                        {adminName}
                     </Typography>

                     <Typography className="text-xs!" color="textSecondary">{roleLabel}</Typography>
                  </Box>

                  <KeyboardArrowDownIcon
                     className="text-xl!"
                     sx={{
                        color: "text.secondary",
                        transform: isProfileMenuOpen ? "rotate(180deg)" : "none"
                     }}
                  />
               </button>

               {isProfileMenuOpen && (
                  <button
                     className="text-primary mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-red-500/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                     disabled={isLoggingOut}
                     onClick={handleLogout}>
                     <LogoutOutlinedIcon className="text-[21px]!" />
                     <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
                  </button>
               )}
            </Box>
         </Box>
      </ResponsiveSidebarDrawer>
   )
}
