import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import Header from "@/features/user/components/Header"
import SideBar from "@/features/user/components/Sidebar"
import { Box } from "@mui/material"
import RoleTheme from "@/theme/RoleTheme"

const drawerWidth = 225

type MainLayoutProps = {
   children?: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
   const [sidebarOpen, setSidebarOpen] = useState(false)

   return (
      <RoleTheme role="user">
         <Box className="flex min-h-screen min-w-0 flex-col">
            <Header
               sidebarOpen={sidebarOpen}
               onMenuClick={() => setSidebarOpen(open => !open)}
            />
            <Box className="mt-16 flex w-full min-w-0 flex-1">
               <SideBar
                  drawerWidth={drawerWidth}
                  open={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
               />
               <main className="min-h-[calc(100vh-64px)] min-w-0 flex-1 lg:ml-56.25">
                  <Box className="role-content">{children ?? <Outlet />}</Box>
               </main>
            </Box>
            {/* <Footer /> */}
         </Box>
      </RoleTheme>
   )
}

export default MainLayout
