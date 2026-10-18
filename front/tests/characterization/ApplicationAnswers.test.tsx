import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ApplicationDetails } from "@/features/user/components/application/ApplicationDetails/ApplicationDetails"

const { useWithdrawApplicationMutation, useSendApplicationMessageMutation } = vi.hoisted(
   () => ({
      useWithdrawApplicationMutation: vi.fn(),
      useSendApplicationMessageMutation: vi.fn()
   })
)

vi.mock("@/services/shared/applicationApiCalls", () => ({
   useWithdrawApplicationMutation
}))

vi.mock("@/services/shared/messageApiCalls", () => ({
   useSendApplicationMessageMutation
}))

const application = {
   id: "application-1",
   userId: "user-1",
   jobId: "job-1",
   status: "PENDING" as const,
   matchScore: 82,
   createdAt: "2026-10-10T12:00:00.000Z",
   updatedAt: "2026-10-10T12:00:00.000Z",
   recommendation: null,
   strengths: [],
   missingSkills: [],
   resumeType: "PROFILE" as const,
   cvId: null,
   cvUrl: null,
   job: {
      id: "job-1",
      title: "Frontend Engineer",
      company: {
         companyName: "Example Co",
         logoUrl: null
      }
   },
   answers: [
      {
         id: "answer-1",
         answer: "Five years",
         question: {
            question: "How much experience do you have?",
            type: "TEXT",
            required: true
         }
      },
      {
         id: "answer-2",
         answer: ["React", "TypeScript"],
         question: {
            question: "Which technologies do you use?",
            type: "MULTIPLE_CHOICE",
            required: false
         }
      }
   ]
}

describe("application answers details", () => {
   beforeEach(() => {
      useWithdrawApplicationMutation.mockReturnValue([
         vi.fn(),
         { isUninitialized: true, isLoading: false, isSuccess: false, isError: false }
      ])
      useSendApplicationMessageMutation.mockReturnValue([
         vi.fn(),
         { isUninitialized: true, isLoading: false, isSuccess: false, isError: false }
      ])
   })

   it("shows question and answer values when View Answers is expanded", () => {
      render(
         <MemoryRouter>
            <ApplicationDetails application={application} onClose={vi.fn()} />
         </MemoryRouter>
      )

      expect(screen.queryByText(/How much experience do you have\?/)).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole("button", { name: "View Answers" }))

      expect(screen.getByRole("button", { name: "Hide Answers" })).toHaveAttribute(
         "aria-expanded",
         "true"
      )
      expect(screen.getByText(/How much experience do you have\?/)).toBeInTheDocument()
      expect(screen.getByText("Five years")).toBeInTheDocument()
      expect(screen.getByText(/Which technologies do you use\?/)).toBeInTheDocument()
      expect(screen.getByText("React")).toBeInTheDocument()
      expect(screen.getByText("TypeScript")).toBeInTheDocument()

      fireEvent.click(screen.getByRole("button", { name: "Hide Answers" }))
      expect(screen.queryByText(/How much experience do you have\?/)).not.toBeInTheDocument()
   })
})
