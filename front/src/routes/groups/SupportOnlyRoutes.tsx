import { lazy } from "react"
import type { RouteObject } from "react-router-dom"
import RoutePage from "@/routes/RoutePage"

const SupportOnlyAccessPage = lazy(
   () => import("@/features/support/pages/SupportOnlyAccessPage")
)
const SupportOnlyLayout = lazy(() => import("@/features/support/pages/SupportOnlyLayout"))
const SupportOnlyHomePage = lazy(
   () => import("@/features/support/pages/SupportOnlyHomePage")
)
const SupportOnlyCreatePage = lazy(
   () => import("@/features/support/pages/SupportOnlyCreatePage")
)
const SupportOnlyDetailsPage = lazy(
   () => import("@/features/support/pages/SupportOnlyDetailsPage")
)

const supportOnlyRoutes: RouteObject[] = [
   {
      path: "/support-access/verify",
      element: (
         <RoutePage>
            <SupportOnlyAccessPage />
         </RoutePage>
      )
   },
   {
      path: "/support-only",
      element: (
         <RoutePage>
            <SupportOnlyLayout />
         </RoutePage>
      ),
      children: [
         { index: true, element: <SupportOnlyHomePage /> },
         { path: "requests/create", element: <SupportOnlyCreatePage /> },
         { path: "requests/:ticketId", element: <SupportOnlyDetailsPage /> }
      ]
   }
]

export default supportOnlyRoutes
