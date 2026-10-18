import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import AccountDeactivatedPage from "@/features/auth/pages/AccountDeactivatedPage"

describe("account deactivated page", () => {
   it("explains the account state and offers support verification and login", () => {
      render(
         <MemoryRouter>
            <AccountDeactivatedPage />
         </MemoryRouter>
      )

      expect(
         screen.getByRole("heading", { name: "Account Deactivated" })
      ).toBeInTheDocument()
      expect(
         screen.getByText(/Your account information has not been deleted/i)
      ).toBeInTheDocument()
      expect(screen.getByRole("link", { name: "Contact Support" })).toHaveAttribute(
         "href",
         "/support-access/verify"
      )
      expect(screen.getByRole("link", { name: "Back to Login" })).toHaveAttribute(
         "href",
         "/login"
      )
   })
})
