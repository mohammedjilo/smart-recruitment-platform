import { configureStore } from "@reduxjs/toolkit"
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import CompanyCard from "@/features/admin/components/companies/CompanyCard"
import { authReducer } from "@/redux/slices/authSlice"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"

describe("Demo Admin company cards", () => {
   it("does not offer Edit Company", () => {
      const permissions = [
         ADMIN_PERMISSIONS.DEMO_ADMIN_READ_ONLY,
         ADMIN_PERMISSIONS.VIEW_COMPANIES,
         ADMIN_PERMISSIONS.EDIT_COMPANIES
      ]
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
                  permissions
               },
               company: null,
               token: "test-token",
               permissions,
               companyRegistrationReview: null
            }
         }
      })

      render(
         <Provider store={store}>
            <MemoryRouter>
               <CompanyCard
                  company={{
                     id: "company-1",
                     companyName: "Example Company",
                     slug: "example-company",
                     description: null,
                     logoId: null,
                     logoUrl: null,
                     location: null,
                     status: "ACTIVE",
                     approvalStatus: "APPROVED",
                     rejectionReason: null,
                     reviewedAt: null,
                     _count: { jobs: 0 }
                  }}
               />
            </MemoryRouter>
         </Provider>
      )

      fireEvent.click(screen.getByRole("button"))
      expect(screen.getByRole("menuitem", { name: "View Details" })).toBeInTheDocument()
      expect(screen.queryByRole("menuitem", { name: "Edit Company" })).not.toBeInTheDocument()
   })
})
