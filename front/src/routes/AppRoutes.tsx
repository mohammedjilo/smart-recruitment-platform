import "../App.css"
import { useEffect, useState } from "react"
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import { Box, Typography } from "@mui/material"
import AdminPermissionSynchronizer from "@/features/admin/authorization/AdminPermissionSynchronizer"
import AdminRoutes from "@/routes/groups/AdminRoutes"
import CompanyRoutes from "@/routes/groups/CompanyRoutes"
import PublicAuthRoutes from "@/routes/groups/PublicAuthRoutes"
import SupportOnlyRoutes from "@/routes/groups/SupportOnlyRoutes"
import UserRoutes from "@/routes/groups/UserRoutes"
import DashboardRoute from "./DashboardRoute"

const router = createBrowserRouter([
   ...PublicAuthRoutes,
   ...SupportOnlyRoutes,
   {
      path: "/dashboard",
      element: <DashboardRoute />
   },
   ...AdminRoutes,
   ...UserRoutes,
   ...CompanyRoutes,
   {
      path: "/",
      element: (
         <Navigate
            replace
            to="/login"
         />
      )
   },
   {
      path: "*",
      element: (
         <Typography
            className="mt-8!"
            align="center"
            variant="h6">
            Page not found
         </Typography>
      )
   }
])

function App() {
   const [locationKey, setLocationKey] = useState(router.state.location.pathname)

   useEffect(() => {
      const unsubscribe = router.subscribe(() => {
         setLocationKey(router.state.location.pathname)
      })

      return unsubscribe
   }, [])

   useEffect(() => {
      window.scrollTo({
         top: 0,
         left: 0,
         behavior: "auto"
      })
   }, [locationKey])

   return (
      <Box className="contents">
         <AdminPermissionSynchronizer />
         <RouterProvider router={router} />
      </Box>
   )
}

export default App
