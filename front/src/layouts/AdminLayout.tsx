import { useState, type ReactNode } from "react"
import { Outlet } from "react-router-dom"
import { Alert, Box } from "@mui/material"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import AdminSidebar from "@/features/admin/components/Sidebar"
import AdminHeader from "@/features/admin/components/Header"
import RoleTheme from "@/theme/RoleTheme"
import { isDemoAdminPermissions } from "@/features/admin/authorization/demoAdmin"
import { useGetCurrentAdminPermissionsQuery } from "@/features/admin/services/adminApiCalls"

type AdminLayoutProps = {
   children?: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
   const [sidebarOpen, setSidebarOpen] = useState(false)
   const permissions = useSelector((state: RootState) => state.auth.permissions)
   const user = useSelector((state: RootState) => state.auth.user)
   const permissionsQuery = useGetCurrentAdminPermissionsQuery(
      user?.role === "ADMIN" ? user.id : "",
      { skip: user?.role !== "ADMIN" }
   )
   const isDemoAdmin =
      isDemoAdminPermissions(permissions) ||
      permissionsQuery.currentData?.data.adminRoleNames.includes("DEMO_ADMIN") ===
         true

   return (
      <RoleTheme role="admin">
         <Box className="min-h-screen">
            {/* Sidebar */}
            <AdminSidebar
               open={sidebarOpen}
               onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <Box className="min-h-screen min-w-0 lg:ml-62.5">
               <AdminHeader
                  sidebarOpen={sidebarOpen}
                  onMenuClick={() => setSidebarOpen(prev => !prev)}
               />

               <main className="role-content">
                  {isDemoAdmin && (
                     <Alert className="mx-4 mt-4" severity="info">
                        Read-only demo: you can view administrator data, but cannot make changes. CV files remain unavailable.
                     </Alert>
                  )}
                  {children ?? <Outlet />}
               </main>
            </Box>
         </Box>
      </RoleTheme>
   )
}
