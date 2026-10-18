import {
   List,
   ListItemButton,
   ListItemIcon,
   ListItemText,
   Box
} from "@mui/material"
import ResponsiveSidebarDrawer from "@/components/common/ResponsiveSidebarDrawer"

import {
   AssignmentIndOutlined,
   DashboardOutlined,
   SearchOutlined,
   AssignmentOutlined,
   BookmarkBorderOutlined,
   NotificationsNoneOutlined,
   LogoutOutlined,
   PersonOutlineOutlined,
   BusinessOutlined,
   ContactSupportOutlined,
   ChatBubbleOutlineOutlined
} from "@mui/icons-material"
import { useGetProfessionalProfileQuery } from "@/features/user/services/professionalProfileApiCalls"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuthLogOutMutation } from "@/features/auth/services/authApiCalls"
import { getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"

const navItemClass = (active: boolean) =>
   `group! min-h-8.5 rounded-lg px-3 text-sm! transition-all duration-200 ${
      active
         ? "bg-primary! text-white! hover:bg-primary-dark!"
         : "text-muted hover:bg-primary-tint hover:text-primary"
   }`

const sidebarItems = [
   {
      label: "My Profile",
      icon: PersonOutlineOutlined,
      path: "/profile",
      requiresCompletion: true
   },
   {
      label: "Complete Profile",
      icon: AssignmentIndOutlined,
      path: "/profile/complete",
      hideWhenCompleted: true
   },
   {
      label: "Dashboard",
      icon: DashboardOutlined,
      path: "/dashboard",
      requiresCompletion: true
   },
   {
      label: "Find Jobs",
      icon: SearchOutlined,
      path: "/jobs",
      requiresCompletion: true
   },
   {
      label: "Companies",
      icon: BusinessOutlined,
      path: "/companies",
      requiresCompletion: true
   },
   {
      label: "My Applications",
      icon: AssignmentOutlined,
      path: "/applications",
      requiresCompletion: true
   },
   {
      label: "Saved Jobs",
      icon: BookmarkBorderOutlined,
      path: "/saved-jobs",
      requiresCompletion: true
   },
   {
      label: "Messages",
      icon: ChatBubbleOutlineOutlined,
      path: "/messages",
      requiresCompletion: true
   },
   {
      label: "Notifications",
      icon: NotificationsNoneOutlined,
      path: "/notifications",
      requiresCompletion: true
   },
   {
      label: "Support & Help",
      icon: ContactSupportOutlined,
      path: "/user/support",
      requiresCompletion: true
   }
   // {
   //    label: "Settings",
   //    icon: SettingsOutlined,
   //    path: "/settings",
   //    requiresCompletion: false
   // }
]
export default function SideBar({
   drawerWidth = 225,
   open,
   onClose
}: {
   drawerWidth?: number
   open: boolean
   onClose: () => void
}) {
   const navigate = useNavigate()
   const location = useLocation()
   const userId = useSelector((state: RootState) => state.auth.user?.id)

   const [authLogOut, logoutResult] = useAuthLogOutMutation(undefined)
   const logoutState = getMutationState(logoutResult)
   const logoutPresentation = getMutationPresentation(logoutState, { surface: "action" })
   const { data, isLoading } = useGetProfessionalProfileQuery(userId ?? "", {
      skip: !userId
   })

   const isCompleted = data?.data.completion?.isCompleted === true

   const isPathActive = (path: string) => {
      const currentPath = location.pathname
      return currentPath === path || currentPath.startsWith(`${path}/`)
   }

   const visibleItems = sidebarItems.filter(item => {
      if (item.hideWhenCompleted) {
         return !isLoading && !isCompleted
      }

      if (item.requiresCompletion) {
         return isCompleted
      }

      return true
   })
   useEffect(() => {
      if (logoutPresentation.category === "contextual_success")
         navigate("/login", { replace: true })
   }, [logoutPresentation.category, navigate])
   const handleLogout = () => {
      if (logoutPresentation.category === "loading") return
      void authLogOut(undefined)
   }
   return (
      <ResponsiveSidebarDrawer
         width={drawerWidth}
         top={64}
         open={open}
         onClose={onClose}
      >
      <Box className="border-border bg-surface flex h-full flex-col border-r">
         <nav id="user-navigation" aria-label="User navigation" className="min-h-0 flex-1 overflow-y-auto">
         <Box className="flex h-full flex-col px-3 py-3">
            <List className="space-y-1">
               {visibleItems.map(item => {
                  const Icon = item.icon

                  const isActive = isPathActive(item.path)

                  return (
                     <ListItemButton
                        key={item.path}
                        onClick={() => {
                           onClose()
                           navigate(item.path)
                        }}
                        className={navItemClass(isActive)}
                        sx={{
                           marginBottom: "2px",
                           borderRadius: "8px"
                        }}>
                        <ListItemIcon className="text-inherit!">
                           <Icon
                              className="text-inherit!"
                              sx={{
                                 fontSize: 21
                              }}
                           />
                        </ListItemIcon>

                        <ListItemText primary={item.label} />
                     </ListItemButton>
                  )
               })}
               <ListItemButton
                  key={"/login"}
                  onClick={() => {
                     onClose()
                     handleLogout()
                  }}
                  className={navItemClass(isPathActive("/login"))}
                  sx={{
                     marginBottom: "2px",
                     borderRadius: "8px"
                  }}>
                  <ListItemIcon className="text-inherit!">
                     <LogoutOutlined
                        className="text-inherit!"
                        sx={{
                           fontSize: 21
                        }}
                     />
                  </ListItemIcon>

                  <ListItemText primary={"Log Out"} />
               </ListItemButton>
            </List>

            <div className="mt-auto">{/* Logout */}</div>
         </Box>
         </nav>
      </Box>
      </ResponsiveSidebarDrawer>
   )
}
