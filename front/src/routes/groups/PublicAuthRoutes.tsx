import { lazy } from "react"
import type { RouteObject } from "react-router-dom"
import RoutePage from "../RoutePage"

const Login = lazy(() => import("@/features/auth/pages/Login"))
const AccountDeactivated = lazy(
   () => import("@/features/auth/pages/AccountDeactivatedPage")
)
const Register = lazy(() => import("@/features/auth/pages/Register"))
const RegisterUser = lazy(() => import("@/features/auth/pages/RegisterUser"))
const RegisterCompany = lazy(() => import("@/features/auth/pages/RegisterCompany"))
const CompanyRegistrationStatus = lazy(
   () => import("@/features/auth/pages/CompanyRegistrationStatusPage")
)

const publicAuthRoutes: RouteObject[] = [
   {
      path: "/account-deactivated",
      element: (
         <RoutePage>
            <AccountDeactivated />
         </RoutePage>
      )
   },
   {
      path: "/login",
      element: (
         <RoutePage>
            <Login />
         </RoutePage>
      )
   },
   {
      path: "/company/registration/pending",
      element: (
         <RoutePage>
            <CompanyRegistrationStatus status="PENDING" />
         </RoutePage>
      )
   },
   {
      path: "/company/registration/rejected",
      element: (
         <RoutePage>
            <CompanyRegistrationStatus status="REJECTED" />
         </RoutePage>
      )
   },
   {
      path: "/register",
      element: (
         <RoutePage>
            <Register />
         </RoutePage>
      )
   },
   {
      path: "/register/user",
      element: (
         <RoutePage>
            <RegisterUser />
         </RoutePage>
      )
   },
   {
      path: "/register/company",
      element: (
         <RoutePage>
            <RegisterCompany />
         </RoutePage>
      )
   }
]

export default publicAuthRoutes
