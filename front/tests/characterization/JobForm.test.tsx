import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import JobForm from "@/features/company/components/JobForm/JobForm"
import type { JobFormData } from "@/types/createJob.types"

const { createApplication, updateCompanyJob } = vi.hoisted(() => ({
   createApplication: vi.fn(),
   updateCompanyJob: vi.fn()
}))

vi.mock("@/services/shared/jobApiCalls", () => ({
   useCreateApplicationMutation: () => [createApplication, { isLoading: false }]
}))

vi.mock("@/features/company/services/companyApiCalls", () => ({
   useUpdateCompanyJobByIdMutation: () => [updateCompanyJob, { isLoading: false }]
}))

vi.mock("@/utils/swal", () => ({ showAlert: vi.fn() }))
vi.mock("@/features/company/components/createJob/JobTips", () => ({
   default: () => null
}))
vi.mock("@/features/company/components/createJob/QuestionTypesPreview", () => ({
   default: () => null
}))

const validForm: JobFormData = {
   title: "Frontend Engineer",
   employmentType: "FULL_TIME",
   description: "Build accessible recruitment experiences.",
   experience: "3",
   salary: 90000,
   deadline: "2099-12-31",
   skills: ["React"],
   status: "OPEN"
}

const resolvedMutation = () => ({ unwrap: () => Promise.resolve({}) })

describe("JobForm characterization", () => {
   beforeEach(() => {
      createApplication.mockReturnValue(resolvedMutation())
      updateCompanyJob.mockReturnValue(resolvedMutation())
   })

   it("keeps the details step active and displays schema feedback when required fields are empty", async () => {
      const user = userEvent.setup()
      render(<JobForm mode="create" />)

      await user.click(screen.getByRole("button", { name: "Next" }))

      expect(screen.getByText("Title is required")).toBeInTheDocument()
      expect(screen.getByText("Job Information")).toBeInTheDocument()
      expect(createApplication).not.toHaveBeenCalled()
   })

   it("initializes edit fields from supplied job data", () => {
      render(
         <JobForm
            mode="edit"
            initialData={{ form: validForm, questions: [] }}
            jobId="job-7"
         />
      )

      expect(screen.getByPlaceholderText("e.g. Frontend Developer")).toHaveValue(
         "Frontend Engineer"
      )
      expect(
         screen.getByPlaceholderText(
            "Describe the role, responsibilities, and what you're looking for..."
         )
      ).toHaveValue("Build accessible recruitment experiences.")
   })

   it("preserves edits through the wizard and submits the create payload", async () => {
      const user = userEvent.setup()
      render(
         <JobForm
            mode="create"
            initialData={{ form: validForm, questions: [] }}
         />
      )

      const title = screen.getByPlaceholderText("e.g. Frontend Developer")
      fireEvent.change(title, { target: { value: "Senior Frontend Engineer" } })
      await user.click(screen.getByRole("button", { name: "Next" }))
      expect(screen.getByText("Application Questions")).toBeInTheDocument()

      await user.click(screen.getByRole("button", { name: "Next" }))
      expect(screen.getByText("Senior Frontend Engineer")).toBeInTheDocument()
      await user.click(screen.getByRole("button", { name: "Publish Job" }))

      await waitFor(() => expect(createApplication).toHaveBeenCalledOnce())
      expect(createApplication).toHaveBeenCalledWith(
         expect.objectContaining({
            title: "Senior Frontend Engineer",
            employmentType: "FULL_TIME",
            description: "Build accessible recruitment experiences.",
            experienceRequired: 3,
            salary: 90000,
            deadline: "2099-12-31",
            skills: ["React"],
            status: "OPEN",
            questions: []
         })
      )
   })

   it("submits the supplied edit data to the update mutation", async () => {
      const user = userEvent.setup()
      render(
         <JobForm
            mode="edit"
            initialData={{ form: validForm, questions: [] }}
            jobId="job-7"
            initialStep={3}
         />
      )

      await user.click(screen.getByRole("button", { name: "Save Changes" }))

      await waitFor(() => expect(updateCompanyJob).toHaveBeenCalledOnce())
      expect(updateCompanyJob).toHaveBeenCalledWith({
         id: "job-7",
         body: expect.objectContaining({
            title: "Frontend Engineer",
            employmentType: "FULL_TIME",
            experienceRequired: 3,
            status: "OPEN",
            questions: []
         })
      })
      expect(createApplication).not.toHaveBeenCalled()
   })

   it("shows the mutation error and keeps the create draft after a failed publish", async () => {
      const user = userEvent.setup()
      createApplication.mockReturnValue({
         unwrap: () =>
            Promise.reject({
               status: 500,
               data: {
                  success: false,
                  error: {
                     code: "INTERNAL_ERROR",
                     message: "Publish failed in characterization test."
                  }
               }
            })
      })
      render(
         <JobForm
            mode="create"
            initialData={{ form: validForm, questions: [] }}
            initialStep={3}
         />
      )

      await user.click(screen.getByRole("button", { name: "Publish Job" }))

      expect(
         await screen.findByText("Publish failed in characterization test.")
      ).toBeInTheDocument()
      expect(screen.getByText("Frontend Engineer")).toBeInTheDocument()
   })
})
