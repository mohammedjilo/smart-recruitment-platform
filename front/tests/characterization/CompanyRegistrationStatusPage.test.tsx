import { configureStore } from "@reduxjs/toolkit"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import { authActions, authReducer } from "@/redux/slices/authSlice"
import type { CompanyRegistrationStatusResponse } from "@/types/auth"
import CompanyRegistrationStatusPage from "@/features/auth/pages/CompanyRegistrationStatusPage"

const review: CompanyRegistrationStatusResponse = {
   registrationStatus: "PENDING",
   company: {
      id: "company-1",
      companyName: "Acme",
      slug: "acme",
      description: null,
      email: "company@example.test",
      phone: "1234567890",
      logoUrl: null,
      website: null,
      location: null,
      rejectionReason: null,
      reviewedAt: null,
      submittedAt: "2026-10-01T10:00:00.000Z"
   }
}

const renderStatusPage = (
   status: "PENDING" | "REJECTED",
   companyReview?: CompanyRegistrationStatusResponse
) => {
   const store = configureStore({ reducer: { auth: authReducer } })
   if (companyReview) {
      store.dispatch(authActions.setCompanyRegistrationReview(companyReview))
   }

   return render(
      <Provider store={store}>
         <MemoryRouter>
            <CompanyRegistrationStatusPage status={status} />
         </MemoryRouter>
      </Provider>
   )
}

describe("company registration status pages", () => {
   it("shows pending status, submission date, and the login action", () => {
      renderStatusPage("PENDING", review)

      expect(
         screen.getByRole("heading", { name: "Registration Under Review" })
      ).toBeInTheDocument()
      expect(screen.getByText("Pending Review")).toBeInTheDocument()
      expect(
         screen.getByText(/cannot access the normal dashboard until it has been approved/i)
      ).toBeInTheDocument()
      expect(screen.getByRole("link", { name: "Back to Login" })).toHaveAttribute(
         "href",
         "/login"
      )
   })

   it("shows rejection feedback and offers the existing resubmission form", () => {
      const rejectedReview: CompanyRegistrationStatusResponse = {
         ...review,
         registrationStatus: "REJECTED",
         company: {
            ...review.company,
            rejectionReason: "Please update your company website.",
            reviewedAt: "2026-10-02T10:00:00.000Z"
         }
      }
      renderStatusPage("REJECTED", rejectedReview)

      expect(
         screen.getByRole("heading", { name: "Registration Rejected" })
      ).toBeInTheDocument()
      expect(
         screen.getByText("Please update your company website.")
      ).toBeInTheDocument()
      expect(
         screen.getByRole("link", { name: "Review & Resubmit" })
      ).toHaveAttribute("href", "/register/company")
   })

   it("renders a useful rejected state when no reason is available", () => {
      renderStatusPage("REJECTED")

      expect(
         screen.getByText(/No additional rejection reason was provided/i)
      ).toBeInTheDocument()
   })
})
