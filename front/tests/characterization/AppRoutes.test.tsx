import { configureStore } from "@reduxjs/toolkit"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import { authReducer } from "@/redux/slices/authSlice"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"

const { permissionsQuery } = vi.hoisted(() => ({
   permissionsQuery: {
      isUninitialized: false,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      data: {
         status: "success",
         data: { permissions: ["VIEW_JOBS"] }
      },
      currentData: {
         status: "success",
         data: { permissions: ["VIEW_JOBS"] }
      },
      refetch: vi.fn()
   }
}))

vi.mock("@/features/admin/services/adminApiCalls", () => ({
   useGetCurrentAdminPermissionsQuery: () => permissionsQuery
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

vi.mock("@/features/admin/pages/JobDetailsPage", async () => {
   const { useParams } = await import("react-router-dom")
   return {
      default: function AdminJobDetailsPage() {
         const { id, slug } = useParams()
         return <div>Loaded admin job {id} / {slug}</div>
      }
   }
})

describe("application route characterization", () => {
   it("loads a directly visited parameterized admin route through the real guards", async () => {
      window.history.replaceState({}, "", "/admin/jobs/job-7/sample-slug")
      vi.spyOn(window, "scrollTo").mockImplementation(() => {})
      vi.spyOn(console, "log").mockImplementation(() => {})

      const store = configureStore({
         reducer: { auth: authReducer },
         preloadedState: {
            auth: {
               user: {
                  id: "admin-1",
                  firstName: "Ada",
                  lastName: "Admin",
                  email: "admin@example.test",
                  profilePicUrl: "",
                  role: "ADMIN" as const,
                  permissions: [ADMIN_PERMISSIONS.VIEW_JOBS]
               },
               company: null,
               token: "test-token",
               permissions: [ADMIN_PERMISSIONS.VIEW_JOBS]
            }
         }
      })
      const { default: App } = await import("@/routes/AppRoutes")

      render(
         <Provider store={store}>
            <App />
         </Provider>
      )

      expect(
         await screen.findByText("Loaded admin job job-7 / sample-slug")
      ).toBeInTheDocument()
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
   }, 60000)
})
