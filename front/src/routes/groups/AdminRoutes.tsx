import { lazy } from "react"
import type { RouteObject } from "react-router-dom"
import AdminLayout from "@/layouts/AdminLayout"
import AdminGuard from "@/routes/guards/AdminGuard"
import PermissionGuard from "@/features/admin/authorization/PermissionGuard"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"
import AdminWorkspaceRedirect from "@/features/admin/components/AdminWorkspaceRedirect"
import RoutePage from "../RoutePage"

const AdminNotificationsPage = lazy(
   () => import("@/features/admin/pages/NotificationsPage")
)
const AboutPage = lazy(() => import("@/features/shared/pages/AboutPage"))
const AdminDashboard = lazy(() => import("@/features/admin/pages/DashboardPage"))
const OperationsDashboard = lazy(
   () => import("@/features/admin/pages/OperationsDashboardPage")
)
const CompanyRequests = lazy(
   () => import("@/features/admin/pages/CompanyRequestsPage")
)
const Companies = lazy(() => import("@/features/admin/pages/CompaniesPage"))
const AdminCompanyDetails = lazy(
   () => import("@/features/admin/pages/CompanyDetailsPage")
)
const AdminJobs = lazy(() => import("@/features/admin/pages/JobsPage"))
const AdminUsers = lazy(() => import("@/features/admin/pages/UsersPage"))
const AdminUserDetails = lazy(
   () => import("@/features/admin/pages/UserDetailsPage")
)
const AdminApplications = lazy(
   () => import("@/features/admin/pages/ApplicationsPage")
)
const AdminJobDetails = lazy(() => import("@/features/admin/pages/JobDetailsPage"))
const AdminSupport = lazy(() => import("@/features/admin/pages/SupportPage"))
const AdminSupportTicketDetails = lazy(
   () => import("@/features/admin/pages/SupportTicketDetailsPage")
)
const AdminManagement = lazy(
   () => import("@/features/admin/pages/AdminManagementPage")
)
const CreateAdmin = lazy(() => import("@/features/admin/pages/CreateAdminPage"))
const AdminDetails = lazy(() => import("@/features/admin/pages/AdminDetailsPage"))
const ApplicationDetailsPage = lazy(
   () => import("@/features/admin/pages/ApplicationDetailsPage")
)
const SupportDashboard = lazy(
   () => import("@/features/admin/pages/SupportDashboardPage")
)
const Forbidden = lazy(() => import("@/features/admin/pages/ForbiddenPage"))

const adminRoutes: RouteObject[] = [
   {
      element: <AdminGuard />,
      children: [
         {
            path: "/admin",
            element: <AdminWorkspaceRedirect />
         },
         {
            path: "/admin/forbidden",
            element: (
               <AdminLayout>
                  <RoutePage>
                     <Forbidden />
                  </RoutePage>
               </AdminLayout>
            )
         },
         {
            path: "/admin/dashboard",
            element: (
               <AdminLayout>
                  <PermissionGuard
                     permission={ADMIN_PERMISSIONS.VIEW_ADMIN_DASHBOARD}
                     fallback={<AdminWorkspaceRedirect />}>
                     <RoutePage>
                        <AdminDashboard />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/support",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_SUPPORT_DASHBOARD}>
                     <RoutePage>
                        <SupportDashboard />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/operations",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_OPERATIONS_DASHBOARD}>
                     <RoutePage>
                        <OperationsDashboard />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/company-requests",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_COMPANIES}>
                     <RoutePage>
                        <CompanyRequests />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/companies",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_COMPANIES}>
                     <RoutePage>
                        <Companies />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/companies/:id",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_COMPANY_DETAILS}>
                     <RoutePage>
                        <AdminCompanyDetails />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/users",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_USERS}>
                     <RoutePage>
                        <AdminUsers />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/users/:id",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_USER_DETAILS}>
                     <RoutePage>
                        <AdminUserDetails />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/jobs",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_JOBS}>
                     <RoutePage>
                        <AdminJobs />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/jobs/:id/:slug",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_JOBS}>
                     <RoutePage>
                        <AdminJobDetails />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/applications",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_APPLICATIONS}>
                     <RoutePage>
                        <AdminApplications />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/applications/:id",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_APPLICATIONS}>
                     <RoutePage>
                        <ApplicationDetailsPage />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/admins",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_ADMINS}>
                     <RoutePage>
                        <AdminManagement />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/admins/new",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.CREATE_ADMIN}>
                     <RoutePage>
                        <CreateAdmin />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/admins/:userId",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_ADMINS}>
                     <RoutePage>
                        <AdminDetails />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/about",
            element: (
               <AdminLayout>
                  <RoutePage>
                     <AboutPage />
                  </RoutePage>
               </AdminLayout>
            )
         },
         {
            path: "/admin/support/tickets",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_SUPPORT}>
                     <RoutePage>
                        <AdminSupport />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/support/:ticketId",
            element: (
               <AdminLayout>
                  <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_SUPPORT}>
                     <RoutePage>
                        <AdminSupportTicketDetails />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         },
         {
            path: "/admin/notifications",
            element: (
               <AdminLayout>
                  <PermissionGuard
                     permissions={[
                        ADMIN_PERMISSIONS.VIEW_SUPPORT,
                        ADMIN_PERMISSIONS.VIEW_SUPPORT_DASHBOARD,
                        ADMIN_PERMISSIONS.VIEW_COMPANIES
                     ]}>
                     <RoutePage>
                        <AdminNotificationsPage />
                     </RoutePage>
                  </PermissionGuard>
               </AdminLayout>
            )
         }
      ]
   }
]

export default adminRoutes
