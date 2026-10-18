import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ApplicationDetails from "@/features/company/components/Applications/ApplicationDetails/ApplicationDetails"
import type { CompanyApplication } from "@/types/application"

const { useUpdateApplicationStatusMutation } = vi.hoisted(() => ({
   useUpdateApplicationStatusMutation: vi.fn()
}))

vi.mock("@/services/shared/applicationApiCalls", () => ({
   useUpdateApplicationStatusMutation
}))

const Location = () => {
   const location = useLocation()
   return <output data-testid="location">{location.pathname}</output>
}

const application: CompanyApplication = {
   id: "application-1",
   status: "PENDING",
   matchScore: 82,
   recommendation: null,
   strengths: [],
   missingSkills: [],
   resumeType: "PROFILE",
   cvId: null,
   cvUrl: null,
   profileSnapshot: null,
   createdAt: "2026-10-10T12:00:00.000Z",
   updatedAt: "2026-10-10T12:00:00.000Z",
   userId: "user-1",
   jobId: "job-1",
   user: {
      id: "user-1",
      firstName: "Taylor",
      lastName: "Candidate",
      email: "taylor@example.test",
      profilePicUrl: null
   },
   job: {
      id: "job-1",
      title: "Frontend Engineer",
      slug: "frontend-engineer"
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

describe("company application details", () => {
   beforeEach(() => {
      useUpdateApplicationStatusMutation.mockReturnValue([
         vi.fn(),
         { isUninitialized: true, isLoading: false, isSuccess: false, isError: false }
      ])
   })

   it("expands answers and navigates to the applied job", () => {
      render(
         <MemoryRouter initialEntries={["/company/applications"]}>
            <ApplicationDetails application={application} onClose={vi.fn()} />
            <Location />
         </MemoryRouter>
      )

      fireEvent.click(screen.getByRole("button", { name: "View Answers" }))
      expect(screen.getByText(/How much experience do you have\?/)).toBeInTheDocument()
      expect(screen.getByText("Five years")).toBeInTheDocument()
      expect(screen.getByText("React")).toBeInTheDocument()
      expect(screen.getByText("TypeScript")).toBeInTheDocument()

      fireEvent.click(screen.getByRole("button", { name: "View Job" }))
      expect(screen.getByTestId("location")).toHaveTextContent(
         "/company/jobs/job-1/frontend-engineer"
      )
   })

   it("renders safely when an application has no answers field", () => {
      const { answers: _answers, ...applicationWithoutAnswers } = application

      render(
         <MemoryRouter>
            <ApplicationDetails
               application={applicationWithoutAnswers}
               onClose={vi.fn()}
            />
         </MemoryRouter>
      )

      expect(screen.getByText("0 answers submitted")).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: "View Answers" })).not.toBeInTheDocument()
   })
})
