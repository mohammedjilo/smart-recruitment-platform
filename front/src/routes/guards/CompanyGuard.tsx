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
            to="/dashboard"
            replace
         />
      )
   }

   if (!company) {
      return (
         <Navigate
            to="/login"
            replace
            state={{ from: location }}
         />
      )
   }

   if (company.approvalStatus !== "APPROVED") {
      return (
         <Navigate
            to={
               company.approvalStatus === "PENDING"
                  ? "/company/registration/pending"
                  : "/company/registration/rejected"
            }
            replace
         />
      )
   }

   return <Outlet />
}
