import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import ApplyModal from "@/features/user/components/JobDetails/application/ApplyModal"

vi.mock("@/features/user/components/JobDetails/application/BasicInformationStep", () => ({
   default: () => <div>Basic information</div>
}))
vi.mock("@/features/user/components/JobDetails/application/JobSummarySidebar", () => ({
   default: () => <div>Job summary</div>
}))
vi.mock("@/features/user/components/JobDetails/application/QuestionsStep", () => ({
   default: () => <div>Questions</div>
}))
vi.mock("@/features/user/components/JobDetails/application/ReviewStep", () => ({
   default: () => <div>Review</div>
}))
vi.mock("@/services/shared/applicationApiCalls", () => ({
   useApplyToJobMutation: () => [
      vi.fn(),
      {
         isLoading: false,
         isUninitialized: true,
         isSuccess: false,
         isError: false
      }
   ]
}))
vi.mock("@/services/shared/jobApiCalls", () => ({
   useGetQuestionsQuery: () => ({
      data: { data: [] },
      isLoading: false,
      isError: false
   })
}))

describe("ApplyModal accessibility", () => {
   it("gives the close icon button an accessible name", () => {
      render(
         <MemoryRouter>
            <ApplyModal
               open
               handleClose={vi.fn()}
               userId="user-1"
               companyId="company-1"
               jobSummaryData={{
                  companyName: "Analytical Engines",
                  logoUrl: null,
                  location: null,
                  salary: null,
                  title: "Engineer",
                  employmentType: "FULL_TIME",
                  createdAt: new Date("2026-01-01T00:00:00Z"),
                  deadline: "2026-12-31",
                  skills: []
               }}
            />
         </MemoryRouter>
      )

      expect(
         screen.getByRole("button", { name: "Close application form" })
      ).toBeInTheDocument()
   })
})
