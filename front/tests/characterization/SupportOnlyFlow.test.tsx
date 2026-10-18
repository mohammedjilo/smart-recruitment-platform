import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import SupportOnlyAccessPage from "@/features/support/pages/SupportOnlyAccessPage"
import SupportOnlyDetailsPage from "@/features/support/pages/SupportOnlyDetailsPage"

const supportApi = vi.hoisted(() => ({
   verify: vi.fn(),
   ticketQuery: vi.fn(),
   reply: vi.fn()
}))

vi.mock("@/services/api/supportOnlyApi", async importOriginal => {
   const actual =
      await importOriginal<typeof import("@/services/api/supportOnlyApi")>()
   return {
      ...actual,
      verifySupportOnlyCredentials: supportApi.verify,
      useGetSupportOnlyTicketQuery: supportApi.ticketQuery,
      useAddSupportOnlyMessageMutation: () => [
         supportApi.reply,
         { isLoading: false, isError: false }
      ]
   }
})

const unwrap = (value: unknown) => ({ unwrap: () => Promise.resolve(value) })

describe("Support-only flow", () => {
   beforeEach(() => {
      vi.clearAllMocks()
      supportApi.verify.mockResolvedValue({
         success: true,
         data: { mode: "support_only" }
      })
      supportApi.ticketQuery.mockReturnValue({
         data: {
            success: true,
            data: {
               id: "ticket-1",
               subject: "Cannot access my account",
               description: "I need help signing in.",
               status: "OPEN",
               priority: "MEDIUM",
               createdAt: "2026-10-10T10:00:00.000Z",
               updatedAt: "2026-10-10T10:00:00.000Z",
               category: { name: "Account access" },
               messages: [
                  {
                     id: "admin-message",
                     content: "We have received your request.",
                     createdAt: "2026-10-10T11:00:00.000Z",
                     authorUser: {
                        role: "ADMIN",
                        firstName: "Support",
                        lastName: "Agent"
                     },
                     authorCompany: null
                  }
               ]
            }
         },
         isLoading: false,
         isError: false
      })
      supportApi.reply.mockReturnValue(unwrap({ success: true, data: {} }))
   })

   it("uses the support-only error type for errors shown by the page", async () => {
      supportApi.verify.mockRejectedValue(new Error("Invalid email or password."))
      render(
         <MemoryRouter initialEntries={["/support-access/verify"]}>
            <Routes>
               <Route
                  path="/support-access/verify"
                  element={<SupportOnlyAccessPage />}
               />
            </Routes>
         </MemoryRouter>
      )

      fireEvent.change(screen.getByLabelText(/Account email/), {
         target: { value: "invalid@example.test" }
      })
      fireEvent.change(screen.getByLabelText(/Password/), {
         target: { value: "incorrect-password" }
      })
      fireEvent.click(screen.getByRole("button", { name: "Verify and continue" }))

      expect(await screen.findByRole("alert")).toHaveTextContent(
         "Invalid email or password."
      )
   })

   it("verifies credentials without Redux login and sends active accounts to normal login", async () => {
      supportApi.verify.mockResolvedValueOnce({ success: true, data: { mode: "active" } })
      render(
         <MemoryRouter initialEntries={["/support-access/verify"]}>
            <Routes>
               <Route
                  path="/support-access/verify"
                  element={<SupportOnlyAccessPage />}
               />
               <Route
                  path="/login"
                  element={<div>Normal login</div>}
               />
               <Route
                  path="/support-only"
                  element={<div>Restricted Support</div>}
               />
            </Routes>
         </MemoryRouter>
      )

      fireEvent.change(screen.getByLabelText(/Account email/), {
         target: { value: "active@example.test" }
      })
      fireEvent.change(screen.getByLabelText(/Password/), {
         target: { value: "correct-password" }
      })
      fireEvent.click(screen.getByRole("button", { name: "Verify and continue" }))

      expect(await screen.findByText("Normal login")).toBeInTheDocument()
      expect(supportApi.verify).toHaveBeenCalledWith({
         role: "user",
         email: "active@example.test",
         password: "correct-password"
      })

   })

   it("shows Admin replies and posts replies through the restricted Support API", async () => {
      render(
         <MemoryRouter initialEntries={["/support-only/requests/ticket-1"]}>
            <Routes>
               <Route
                  path="/support-only/requests/:ticketId"
                  element={<SupportOnlyDetailsPage />}
               />
            </Routes>
         </MemoryRouter>
      )

      expect(
         await screen.findByText("We have received your request.")
      ).toBeInTheDocument()
      fireEvent.change(screen.getByLabelText("Reply"), { target: { value: "Thank you" } })
      fireEvent.click(screen.getByRole("button", { name: "Send reply" }))
      await waitFor(() =>
         expect(supportApi.reply).toHaveBeenCalledWith({
            ticketId: "ticket-1",
            content: "Thank you"
         })
      )
   })
})
