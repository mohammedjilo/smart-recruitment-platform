import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"

export default function UserGuard() {
   const user = useSelector((state: RootState) => state.auth.user)
   const company = useSelector((state: RootState) => state.auth.company)
   const location = useLocation()

   if (company) {
      return (
         <Navigate
            replace
            to="/dashboard"
         />
      )
   }

   if (!user || user.role !== "USER") {
      return (
         <Navigate
            replace
            state={{ from: location }}
            to="/login"
         />
      )
   }

   return <Outlet />
}
