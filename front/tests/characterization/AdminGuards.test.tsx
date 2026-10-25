import { configureStore } from "@reduxjs/toolkit"
import { render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import PermissionGuard from "@/features/admin/authorization/PermissionGuard"
import AdminPermissionSynchronizer from "@/features/admin/authorization/AdminPermissionSynchronizer"
import AdminGuard from "@/routes/guards/AdminGuard"
import { authReducer } from "@/redux/slices/authSlice"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"

const { query } = vi.hoisted(() => ({
   query: {
      isUninitialized: false,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      data: { status: "success", data: { permissions: [] as string[] } },
      currentData: {
         status: "success",
         data: { permissions: [] as string[] }
      },
      refetch: vi.fn()
   }
}))

vi.mock("@/features/admin/services/adminApiCalls", () => ({
   useGetCurrentAdminPermissionsQuery: () => query
}))

const createStore = (
   role: "USER" | "ADMIN" | null = "ADMIN",
   permissions: string[] = [],
   isCompany = false
) =>
   configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
         auth: {
            user: role
               ? {
               id: "user-1",
               firstName: "Ada",
               lastName: "Lovelace",
               email: "ada@example.test",
               profilePicUrl: "",
               role,
               permissions
                 }
               : null,
            company: isCompany
               ? {
                    id: "company-1",
                    companyName: "Analytical Engines",
                    email: "company@example.test",
                    logoUrl: "",
                    role: "company" as const
                 }
               : null,
            token: null,
            permissions
         }
      }
   })

const renderRoutes = (element: React.ReactNode, store = createStore()) =>
   render(
      <Provider store={store}>
         <MemoryRouter initialEntries={["/admin/private"]}>
            <Routes>
               <Route element={element} path="/admin/private" />
               <Route element={<div>Forbidden route</div>} path="/admin/forbidden" />
               <Route element={<div>Login route</div>} path="/login" />
               <Route element={<div>Dashboard route</div>} path="/dashboard" />
               <Route element={<div>Unknown route</div>} path="*" />
            </Routes>
         </MemoryRouter>
      </Provider>
   )

const renderPermissionRoute = (
   element: React.ReactNode,
   store = createStore()
) =>
   render(
      <Provider store={store}>
         <MemoryRouter initialEntries={["/admin/private"]}>
            <Routes>
               <Route element={<AdminGuard />}>
                  <Route element={element} path="/admin/private" />
               </Route>
               <Route element={<div>Forbidden route</div>} path="/admin/forbidden" />
            </Routes>
         </MemoryRouter>
      </Provider>
   )

describe("admin guard characterization", () => {
   beforeEach(() => {
      query.data = { status: "success", data: { permissions: [] } }
      query.currentData = { status: "success", data: { permissions: [] } }
      query.isUninitialized = false
      query.isLoading = false
      query.isFetching = false
      query.isSuccess = true
      query.isError = false
   })

   it("renders guarded content when the required permission is present", () => {
      query.data = {
         status: "success",
         data: { permissions: [ADMIN_PERMISSIONS.VIEW_USERS] }
      }
      query.currentData = query.data
      renderPermissionRoute(
         <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_USERS}>
            <div>Users workspace</div>
         </PermissionGuard>,
         createStore("ADMIN", [ADMIN_PERMISSIONS.VIEW_USERS])
      )

      expect(screen.getByText("Users workspace")).toBeInTheDocument()
   })

   it("redirects to the forbidden route when permission is absent", async () => {
      query.data = { status: "success", data: { permissions: [] } }
      query.currentData = query.data
      renderPermissionRoute(
         <PermissionGuard permission={ADMIN_PERMISSIONS.VIEW_USERS}>
            <div>Users workspace</div>
         </PermissionGuard>
      )

      expect(await screen.findByText("Forbidden route")).toBeInTheDocument()
      expect(screen.queryByText("Users workspace")).not.toBeInTheDocument()
   })

   it("allows a route when any listed permission is present", () => {
      query.data = {
         status: "success",
         data: { permissions: [ADMIN_PERMISSIONS.VIEW_COMPANIES] }
      }
      query.currentData = query.data
      renderPermissionRoute(
         <PermissionGuard
            permissions={[
               ADMIN_PERMISSIONS.VIEW_USERS,
               ADMIN_PERMISSIONS.VIEW_COMPANIES
            ]}>
            <div>Shared admin workspace</div>
         </PermissionGuard>,
         createStore("ADMIN", [ADMIN_PERMISSIONS.VIEW_COMPANIES])
      )

      expect(screen.getByText("Shared admin workspace")).toBeInTheDocument()
   })

   it("synchronizes verified admin permissions into auth state before rendering its outlet", async () => {
      query.data = {
         status: "success",
         data: { permissions: [ADMIN_PERMISSIONS.VIEW_USERS] }
      }
      query.currentData = query.data
      const store = createStore()
      render(
         <Provider store={store}>
            <>
               <AdminPermissionSynchronizer />
               <MemoryRouter initialEntries={["/admin/private"]}>
                  <Routes>
                     <Route element={<AdminGuard />}>
                        <Route
                           element={<div>Admin workspace</div>}
                           path="/admin/private"
                        />
                     </Route>
                  </Routes>
               </MemoryRouter>
            </>
         </Provider>
      )

      expect(await screen.findByText("Admin workspace")).toBeInTheDocument()
      await waitFor(() =>
         expect(store.getState().auth.permissions).toEqual([
            ADMIN_PERMISSIONS.VIEW_USERS
         ])
      )
   })

   it("redirects a non-admin user to the dashboard without rendering the admin outlet", async () => {
      const store = createStore("USER")
      renderRoutes(<AdminGuard />, store)

      expect(await screen.findByText("Dashboard route")).toBeInTheDocument()
      expect(store.getState().auth.permissions).toEqual([])
   })

   it("redirects an unauthenticated visitor to login", async () => {
      renderRoutes(<AdminGuard />, createStore(null))

      expect(await screen.findByText("Login route")).toBeInTheDocument()
   })

   it("redirects an authenticated company to the dashboard", async () => {
      renderRoutes(<AdminGuard />, createStore(null, [], true))

      expect(await screen.findByText("Dashboard route")).toBeInTheDocument()
   })
})
