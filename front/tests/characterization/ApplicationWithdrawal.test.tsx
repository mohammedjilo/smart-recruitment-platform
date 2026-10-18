import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ApplicationDetails } from "@/features/user/components/application/ApplicationDetails/ApplicationDetails"
import type { UserApplicationDetails } from "@/types/api/applications"

const { withdrawApplication, sendApplicationMessage, showAlert } = vi.hoisted(
   () => ({
      withdrawApplication: vi.fn(),
      sendApplicationMessage: vi.fn(),
      showAlert: vi.fn()
   })
)

vi.mock("@/services/shared/applicationApiCalls", () => ({
   useWithdrawApplicationMutation: () => [
      withdrawApplication,
      { isUninitialized: true, isLoading: false, isSuccess: false, isError: false }
   ]
}))

vi.mock("@/services/shared/messageApiCalls", () => ({
   useSendApplicationMessageMutation: () => [
      sendApplicationMessage,
      { isUninitialized: true, isLoading: false, isSuccess: false, isError: false }
   ]
}))

vi.mock("@/utils/swal", () => ({ showAlert }))

const application: UserApplicationDetails = {
   id: "application-1",
   status: "PENDING",
   matchScore: 82,
   createdAt: "2026-10-10T12:00:00.000Z",
   job: {
      id: "job-1",
      title: "Frontend Engineer",
      company: { companyName: "Example Co", logoUrl: null }
   },
   userId: "user-1",
   jobId: "job-1",
   updatedAt: "2026-10-10T12:00:00.000Z",
   recommendation: null,
   strengths: [],
   missingSkills: [],
   resumeType: "PROFILE",
   cvId: null,
   cvUrl: null,
   answers: []
}

const renderDetails = (status: UserApplicationDetails["status"], onClose = vi.fn()) =>
   render(
      <MemoryRouter>
         <ApplicationDetails
            application={{ ...application, status }}
            onClose={onClose}
         />
      </MemoryRouter>
   )

describe("application withdrawal", () => {
   beforeEach(() => {
      vi.clearAllMocks()
      withdrawApplication.mockReturnValue({
         unwrap: vi.fn().mockResolvedValue({})
      })
      sendApplicationMessage.mockReturnValue({
         unwrap: vi.fn().mockResolvedValue({})
      })
      showAlert.mockResolvedValue({ isConfirmed: false })
   })

   it.each(["PENDING", "REVIEWING", "SHORTLISTED", "INTERVIEW"] as const)(
      "shows the withdraw action for %s applications",
      status => {
         renderDetails(status)
         expect(
            screen.getByRole("button", { name: "Withdraw Application" })
         ).toBeInTheDocument()
      }
   )

   it("warns before withdrawing an accepted application and leaves it untouched on cancel", async () => {
      renderDetails("ACCEPTED")

      fireEvent.click(screen.getByRole("button", { name: "Withdraw Application" }))

      await waitFor(() => expect(showAlert).toHaveBeenCalledOnce())
      expect(showAlert).toHaveBeenCalledWith(
         expect.objectContaining({
            type: "confirm",
            title: "Withdraw Accepted Application?",
            text: expect.stringContaining(
               "The company has accepted your application"
            ),
            confirmText: "Confirm withdrawal",
            cancelText: "Keep application"
         })
      )
      expect(withdrawApplication).not.toHaveBeenCalled()
   })

   it("sends the withdrawal request only after an accepted application is confirmed", async () => {
      const onClose = vi.fn()
      showAlert.mockResolvedValue({ isConfirmed: true })
      renderDetails("ACCEPTED", onClose)

      fireEvent.click(screen.getByRole("button", { name: "Withdraw Application" }))

      await waitFor(() => expect(withdrawApplication).toHaveBeenCalledOnce())
      expect(withdrawApplication).toHaveBeenCalledWith({
         applicationId: "application-1",
         userId: "user-1",
         jobId: "job-1"
      })
      expect(onClose).toHaveBeenCalledOnce()
   })

   it.each(["REJECTED", "WITHDRAWN"] as const)(
      "hides the withdraw action for %s applications",
      status => {
         renderDetails(status)
         expect(
            screen.queryByRole("button", { name: "Withdraw Application" })
         ).not.toBeInTheDocument()
      }
   )
})
