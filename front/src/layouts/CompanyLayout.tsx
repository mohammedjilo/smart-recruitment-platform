import React, { useState } from "react"
import SideBar from "@/features/company/components/Sidebar"
import Header from "@/features/company/components/Header"
import { Outlet } from "react-router-dom"
import { Box } from "@mui/material"
import RoleTheme from "@/theme/RoleTheme"

type CompanyLayoutProps = {
   children?: React.ReactNode
}

const CompanyLayout: React.FC<CompanyLayoutProps> = ({ children }) => {
   const [sidebarOpen, setSidebarOpen] = useState(false)

   return (
      <RoleTheme role="company">
         <Box className="min-h-screen min-w-0">
            <SideBar
               open={sidebarOpen}
               onClose={() => setSidebarOpen(false)}
            />

            <Header
               sidebarOpen={sidebarOpen}
               onMenuClick={() => setSidebarOpen(open => !open)}
            />
            <main className="min-h-screen min-w-0 lg:ml-67">
               <Box className="role-content">{children ?? <Outlet />}</Box>
            </main>
         </Box>
      </RoleTheme>
   )
}

export default CompanyLayout
