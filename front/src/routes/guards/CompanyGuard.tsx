import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"

export default function CompanyGuard() {
   const user = useSelector((state: RootState) => state.auth.user)
   const company = useSelector((state: RootState) => state.auth.company)
   const location = useLocation()

   if (user) {
      return (
         <Navigate
            replace
            to="/dashboard"
         />
      )
   }

   if (!company) {
      return (
         <Navigate
            replace
            state={{ from: location }}
            to="/login"
         />
      )
   }

   if (company.approvalStatus !== "APPROVED") {
      return (
         <Navigate
            replace
            to={
               company.approvalStatus === "PENDING"
                  ? "/company/registration/pending"
                  : "/company/registration/rejected"
            }
         />
      )
   }

   return <Outlet />
}
