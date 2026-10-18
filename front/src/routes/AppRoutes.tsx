import "../App.css"
import { useEffect, useState } from "react"
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import { Typography } from "@mui/material"
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
            to="/login"
            replace
         />
      )
   },
   {
      path: "*",
      element: (
         <Typography
            variant="h6"
            align="center"
            sx={{ mt: 4 }}>
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
      <>
         <AdminPermissionSynchronizer />
         <RouterProvider router={router} />
      </>
   )
}

export default App
