import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { skipToken } from "@reduxjs/toolkit/query"
import ApplicationsPage from "@/features/user/pages/ApplicationsPage"

const {
   getMyApplications,
   getMyApplicationDetails,
   withdrawApplication
} = vi.hoisted(() => ({
   getMyApplications: vi.fn(),
   getMyApplicationDetails: vi.fn(),
   withdrawApplication: vi.fn()
}))

vi.mock("@/services/shared/applicationApiCalls", () => ({
   useGetMyApplicationsQuery: getMyApplications,
   useGetMyApplicationDetailsQuery: getMyApplicationDetails,
   useWithdrawApplicationMutation: () => [
      withdrawApplication,
      { isLoading: false, isError: false }
   ]
}))

vi.mock(
   "@/features/user/components/application/ApplicationDetails/ApplicationDetails",
   () => ({
   ApplicationDetails: ({
      application
   }: {
      application: { job: { title: string } }
   }) => <div data-testid="application-details">{application.job.title} details</div>
   })
)

const application = {
   id: "application-1",
   status: "PENDING" as const,
   matchScore: 87,
   createdAt: "2026-10-10T12:00:00.000Z",
   job: {
      id: "job-1",
      title: "Frontend Engineer",
      company: {
         companyName: "Example Co",
         logoUrl: null
      }
   }
}

describe("My Applications detail loading", () => {
   beforeEach(() => {
      vi.clearAllMocks()
      vi.spyOn(window, "scrollTo").mockImplementation(() => {})
      getMyApplications.mockReturnValue({
         isUninitialized: false,
         isLoading: false,
         isFetching: false,
         isSuccess: true,
         isError: false,
         currentData: { data: [application], meta: { totalCount: 1, pageSize: 5 } },
         refetch: vi.fn()
      })
      getMyApplicationDetails.mockImplementation((applicationId: unknown) =>
         applicationId === skipToken
            ? { isFetching: false, isError: false, currentData: undefined }
            : {
                 isFetching: false,
                 isError: false,
                 currentData: { data: { ...application, userId: "user-1", jobId: "job-1" } }
              }
      )
   })

   it("does not request details until a list row is selected", () => {
      render(
         <MemoryRouter>
            <ApplicationsPage />
         </MemoryRouter>
      )

      expect(getMyApplicationDetails).toHaveBeenCalledExactlyOnceWith(skipToken)
      expect(screen.queryByTestId("application-details")).not.toBeInTheDocument()

      fireEvent.click(screen.getAllByText("Frontend Engineer")[0])

      expect(getMyApplicationDetails).toHaveBeenLastCalledWith("application-1")
      expect(screen.getByTestId("application-details")).toHaveTextContent(
         "Frontend Engineer details"
      )
   })
})
