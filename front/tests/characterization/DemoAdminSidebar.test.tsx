import { configureStore } from "@reduxjs/toolkit"
import { render, screen, within } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AdminSidebar from "@/features/admin/components/Sidebar"
import { authReducer } from "@/redux/slices/authSlice"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"

const { permissionsQuery, logoutResult } = vi.hoisted(() => ({
   permissionsQuery: {
      currentData: {
         data: { adminRoleNames: ["DEMO_ADMIN"] }
      }
   },
   logoutResult: {
      isUninitialized: true,
      isLoading: false,
      isSuccess: false,
      isError: false
   }
}))

vi.mock("@/features/admin/services/adminApiCalls", () => ({
   useGetCurrentAdminPermissionsQuery: () => permissionsQuery
}))

vi.mock("@/features/auth/services/authApiCalls", () => ({
   useAuthLogOutMutation: () => [vi.fn(), logoutResult]
}))

vi.mock("@/components/common/ResponsiveSidebarDrawer", () => ({
   default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

const demoPermissions = [
   ADMIN_PERMISSIONS.DEMO_ADMIN_READ_ONLY,
   ADMIN_PERMISSIONS.VIEW_ADMIN_DASHBOARD,
   ADMIN_PERMISSIONS.VIEW_COMPANIES,
   ADMIN_PERMISSIONS.VIEW_USERS,
   ADMIN_PERMISSIONS.VIEW_JOBS,
   ADMIN_PERMISSIONS.VIEW_APPLICATIONS,
   ADMIN_PERMISSIONS.VIEW_SUPPORT_DASHBOARD,
   ADMIN_PERMISSIONS.VIEW_SUPPORT
]

const renderSidebar = (initialEntry = "/admin") => {
   const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
         auth: {
            user: {
               id: "demo-admin",
               firstName: "Demo",
               lastName: "Admin",
               email: "demo-admin@example.test",
               profilePicUrl: "",
               role: "ADMIN" as const,
               permissions: demoPermissions
            },
            company: null,
            token: "test-token",
            permissions: demoPermissions
         }
      }
   })

   return render(
      <Provider store={store}>
         <MemoryRouter initialEntries={[initialEntry]}>
            <AdminSidebar open onClose={vi.fn()} />
         </MemoryRouter>
      </Provider>
   )
}

describe("Demo Admin navigation", () => {
   beforeEach(() => {
      permissionsQuery.currentData = {
         data: { adminRoleNames: ["DEMO_ADMIN"] }
      }
   })

   it("hides administrator management from Demo Admin navigation", () => {
      renderSidebar()
      const navigation = screen.getByRole("navigation", {
         name: "Admin navigation"
      })

      for (const label of ["Dashboard", "Companies", "Users", "Jobs", "Applications"]) {
         expect(within(navigation).getByRole("link", { name: label })).toBeInTheDocument()
      }
      expect(within(navigation).queryByRole("link", { name: "Admin Management" })).not.toBeInTheDocument()
   })

   it("keeps Support active on a support ticket details page", () => {
      renderSidebar("/admin/support/ticket-123")
      const navigation = screen.getByRole("navigation", {
         name: "Admin navigation"
      })

      expect(
         within(navigation).getByRole("link", { name: "Support" })
      ).toHaveAttribute("aria-current", "page")
      expect(
         within(navigation).getByRole("link", { name: "Support Dashboard" })
      ).not.toHaveAttribute("aria-current", "page")
   })
})
