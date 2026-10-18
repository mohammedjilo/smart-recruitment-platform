import { useState, type ReactNode } from "react"
import { Outlet } from "react-router-dom"
import { Box } from "@mui/material"
import AdminSidebar from "@/features/admin/components/Sidebar"
import AdminHeader from "@/features/admin/components/Header"
import RoleTheme from "@/theme/RoleTheme"

type AdminLayoutProps = {
   children?: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
   const [sidebarOpen, setSidebarOpen] = useState(false)

   return (
      <RoleTheme role="admin">
         <Box className="min-h-screen">
            {/* Sidebar */}
            <AdminSidebar
               open={sidebarOpen}
               onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <Box className="min-h-screen min-w-0 lg:ml-[250px]">
               <AdminHeader
                  sidebarOpen={sidebarOpen}
                  onMenuClick={() => setSidebarOpen(prev => !prev)}
               />

               <main className="role-content">{children ?? <Outlet />}</main>
            </Box>
         </Box>
      </RoleTheme>
   )
}
