import { configureStore } from "@reduxjs/toolkit"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { createMemoryRouter, RouterProvider, useLocation } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import AdminRoutes from "@/routes/groups/AdminRoutes"
import DashboardRoute from "@/routes/DashboardRoute"
import { authReducer } from "@/redux/slices/authSlice"
import { ADMIN_PERMISSIONS, type AdminPermission } from "@/types/adminPermissions"

const { permissionsQuery, operationsQuery } = vi.hoisted(() => ({
   permissionsQuery: {
      isUninitialized: false,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      data: undefined as
         | { status: string; data: { permissions: string[] } }
         | undefined,
      currentData: undefined as
         | { status: string; data: { permissions: string[] } }
         | undefined,
      error: undefined as unknown,
      refetch: vi.fn()
   },
   operationsQuery: {
      isUninitialized: false,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      data: {
         success: true,
         data: { users: 11, companies: 12, jobs: 13, applications: 14 }
      },
      currentData: {
         success: true,
         data: { users: 11, companies: 12, jobs: 13, applications: 14 }
      },
      error: undefined as unknown,
      refetch: vi.fn()
   }
}))

vi.mock("@/features/admin/services/adminApiCalls", () => ({
   useGetCurrentAdminPermissionsQuery: () => permissionsQuery,
   useGetOperationsDashboardQuery: () => operationsQuery
}))

vi.mock("@/layouts/AdminLayout", () => ({
   default: ({ children }: { children: ReactNode }) => <div>{children}</div>
}))
vi.mock("@/layouts/UserLayout", () => ({
   default: ({ children }: { children: ReactNode }) => <div>{children}</div>
}))
vi.mock("@/layouts/CompanyLayout", () => ({
   default: ({ children }: { children: ReactNode }) => <div>{children}</div>
}))

vi.mock("@/features/admin/pages/DashboardPage", () => ({
   default: () => <div>General dashboard page</div>
}))
vi.mock("@/features/admin/pages/SupportDashboardPage", () => ({
   default: () => <div>Support dashboard page</div>
}))
vi.mock("@/features/admin/pages/OperationsDashboardPage", () => ({
   default: () => <div>Operations Dashboard</div>
}))
vi.mock("@/features/admin/pages/ForbiddenPage", () => ({
   default: () => <div>Forbidden page</div>
}))
vi.mock("@/features/admin/pages/NotificationsPage", () => ({
   default: () => <div>Admin notifications page</div>
}))
vi.mock("@/features/user/pages/DashboardPage", () => ({
   default: () => <div>User dashboard page</div>
}))
vi.mock("@/features/company/pages/DashboardPage", () => ({
   default: () => <div>Company dashboard page</div>
}))
vi.mock("@/features/auth/pages/CompanyRegistrationStatusPage", () => ({
   default: ({ status }: { status: string }) => (
      <div>Company registration {status.toLowerCase()} page</div>
   )
}))

const permissionsResponse = (permissions: AdminPermission[]) => ({
   status: "success",
   data: { permissions }
})

const createStore = ({
   role = "ADMIN",
   permissions = [],
   companyApprovalStatus
}: {
   role?: "ADMIN" | "USER" | null
   permissions?: AdminPermission[]
   companyApprovalStatus?: "PENDING" | "APPROVED" | "REJECTED"
} = {}) =>
   configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
         auth: {
            user: role
               ? {
                    id: "admin-1",
                    firstName: "Test",
                    lastName: "User",
                    email: "test@example.test",
                    profilePicUrl: "",
                    role,
                    permissions
                 }
               : null,
            company: companyApprovalStatus
               ? {
                    id: "company-1",
                    companyName: "Test Company",
                    email: "company@example.test",
                    logoUrl: "",
                    role: "company" as const,
                    approvalStatus: companyApprovalStatus
                 }
               : null,
            token: "test-token",
            permissions,
            companyRegistrationReview: null
         }
      }
   })

const LoginPage = () => {
   const location = useLocation()
   return <div>Login page from: {location.state?.from?.pathname ?? "none"}</div>
}

const renderAt = (
   path: string,
   options: Parameters<typeof createStore>[0] = {}
) => {
   const router = createMemoryRouter(
      [
         ...AdminRoutes,
         { path: "/dashboard", element: <DashboardRoute /> },
         { path: "/login", element: <LoginPage /> },
         {
            path: "/company/registration/pending",
            element: <div>Company registration pending page</div>
         },
         {
            path: "/company/registration/rejected",
            element: <div>Company registration rejected page</div>
         },
         { path: "*", element: <div>Not found</div> }
      ],
      { initialEntries: [path] }
   )

   render(
      <Provider store={createStore(options)}>
         <RouterProvider router={router} />
      </Provider>
   )
   return router
}

const setPermissionsQuery = (
   permissions: AdminPermission[],
   state: "success" | "loading" | "error" = "success"
) => {
   permissionsQuery.isUninitialized = false
   permissionsQuery.isLoading = state === "loading"
   permissionsQuery.isFetching = false
   permissionsQuery.isSuccess = state === "success"
   permissionsQuery.isError = state === "error"
   permissionsQuery.data =
      state === "success" ? permissionsResponse(permissions) : undefined
   permissionsQuery.currentData =
      state === "success" ? permissionsResponse(permissions) : undefined
   permissionsQuery.error =
      state === "error"
         ? {
              status: 500,
              data: {
                 success: false,
                 error: { code: "INTERNAL_ERROR", message: "Permission query failed" }
              }
           }
         : undefined
}

describe("Admin workspace routing", () => {
   beforeEach(() => {
      vi.spyOn(console, "log").mockImplementation(() => {})
      setPermissionsQuery([])
      Object.assign(operationsQuery, {
         isUninitialized: false,
         isLoading: false,
         isFetching: false,
         isSuccess: true,
         isError: false,
         data: {
            success: true,
            data: { users: 11, companies: 12, jobs: 13, applications: 14 }
         },
         currentData: {
            success: true,
            data: { users: 11, companies: 12, jobs: 13, applications: 14 }
         },
         error: undefined
      })
   })

   it("routes an operations-only Admin from /admin to the Operations dashboard", async () => {
      const permissions = [ADMIN_PERMISSIONS.VIEW_OPERATIONS_DASHBOARD]
      setPermissionsQuery(permissions)
      const router = renderAt("/admin", { permissions })

      expect(
         await screen.findByText("Operations Dashboard", {}, { timeout: 10000 })
      ).toBeInTheDocument()
      expect(router.state.location.pathname).toBe("/admin/operations")
   })

   it("renders Operations directly without redirecting to the general dashboard", async () => {
      const permissions = [ADMIN_PERMISSIONS.VIEW_OPERATIONS_DASHBOARD]
      setPermissionsQuery(permissions)
      const router = renderAt("/admin/operations", { permissions })

      expect(
         await screen.findByText("Operations Dashboard", {}, { timeout: 10000 })
      ).toBeInTheDocument()
      expect(router.state.location.pathname).toBe("/admin/operations")
      expect(screen.queryByText("General dashboard page")).not.toBeInTheDocument()
   })

   it("forbids direct Operations access when the Admin lacks its permission", async () => {
      setPermissionsQuery([ADMIN_PERMISSIONS.VIEW_USERS])
      const router = renderAt("/admin/operations", {
         permissions: [ADMIN_PERMISSIONS.VIEW_USERS]
      })

      expect(await screen.findByText("Forbidden page")).toBeInTheDocument()
      expect(router.state.location.pathname).toBe("/admin/forbidden")
   })

   it("keeps general dashboard as the first workspace choice for D plus O", async () => {
      const permissions = [
         ADMIN_PERMISSIONS.VIEW_ADMIN_DASHBOARD,
         ADMIN_PERMISSIONS.VIEW_OPERATIONS_DASHBOARD
      ]
      setPermissionsQuery(permissions)
      const router = renderAt("/admin", { permissions })

      expect(await screen.findByText("General dashboard page")).toBeInTheDocument()
      expect(router.state.location.pathname).toBe("/admin/dashboard")
   })

   it("keeps support ahead of operations when both are present without D", async () => {
      const permissions = [
         ADMIN_PERMISSIONS.VIEW_SUPPORT_DASHBOARD,
         ADMIN_PERMISSIONS.VIEW_OPERATIONS_DASHBOARD
      ]
      setPermissionsQuery(permissions)
      const router = renderAt("/admin", { permissions })

      expect(await screen.findByText("Support dashboard page")).toBeInTheDocument()
      expect(router.state.location.pathname).toBe("/admin/support")
   })

   it("forbids workspace selection when only unrelated permissions exist", async () => {
      const permissions = [ADMIN_PERMISSIONS.VIEW_USERS]
      setPermissionsQuery(permissions)
      const router = renderAt("/admin", { permissions })

      expect(await screen.findByText("Forbidden page")).toBeInTheDocument()
      expect(router.state.location.pathname).toBe("/admin/forbidden")
   })

   it("sends an authenticated ordinary User from Admin paths to the User dashboard", async () => {
      setPermissionsQuery([])
      const router = renderAt("/admin/dashboard", { role: "USER" })

      expect(await screen.findByText("User dashboard page")).toBeInTheDocument()
      expect(router.state.location.pathname).toBe("/dashboard")
   })

   it("preserves the return location for an unauthenticated Admin-route visitor", async () => {
      setPermissionsQuery([])
      const router = renderAt("/admin", { role: null })

      expect(await screen.findByText("Login page from: /admin")).toBeInTheDocument()
      expect(router.state.location.pathname).toBe("/login")
   })

   it("sends a Company to /dashboard and preserves its approval redirect", async () => {
      setPermissionsQuery([])
      const router = renderAt("/admin", {
         role: null,
         companyApprovalStatus: "PENDING"
      })

      expect(
         await screen.findByText("Company registration pending page")
      ).toBeInTheDocument()
      expect(router.state.location.pathname).toBe("/company/registration/pending")
   })

   it("sends verified empty permissions to Forbidden", async () => {
      setPermissionsQuery([])
      const router = renderAt("/admin")

      expect(await screen.findByText("Forbidden page")).toBeInTheDocument()
      expect(router.state.location.pathname).toBe("/admin/forbidden")
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
   })

   it("keeps the existing loading state while permissions are loading", async () => {
      setPermissionsQuery([], "loading")
      renderAt("/admin")

      expect(await screen.findByText("Loading permissions...")).toBeInTheDocument()
   })

   it("keeps the existing retry state when permissions fail to load", async () => {
      setPermissionsQuery([], "error")
      renderAt("/admin")

      expect(await screen.findByText("Permission query failed")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument()
   })

   it("preserves the ANY-OF rule for Admin notifications", async () => {
      for (const permission of [
         ADMIN_PERMISSIONS.VIEW_SUPPORT,
         ADMIN_PERMISSIONS.VIEW_SUPPORT_DASHBOARD,
         ADMIN_PERMISSIONS.VIEW_COMPANIES
      ]) {
         setPermissionsQuery([permission])
         renderAt("/admin/notifications", {
            permissions: [permission]
         })
         expect(
            await screen.findByText("Admin notifications page")
         ).toBeInTheDocument()
         cleanup()
      }
   })

   it("keeps Forbidden terminal when opened directly", async () => {
      setPermissionsQuery([])
      const router = renderAt("/admin/forbidden")

      expect(await screen.findByText("Forbidden page")).toBeInTheDocument()
      await waitFor(() => expect(router.state.location.pathname).toBe("/admin/forbidden"))
   })
})
