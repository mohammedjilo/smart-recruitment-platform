import { configureStore } from "@reduxjs/toolkit"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "react-redux"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProfileEditForm from "@/features/user/components/myProfile/ProfileEditForm"

const { mutations } = vi.hoisted(() => ({
   mutations: {
      experience: vi.fn(),
      education: vi.fn(),
      project: vi.fn(),
      certificate: vi.fn(),
      skills: vi.fn(),
      profile: vi.fn(),
      language: vi.fn()
   }
}))

vi.mock("@/features/user/services/experienceApiCalls", () => ({
   useUpdateExperienceMutation: () => [mutations.experience, { isLoading: false }]
}))
vi.mock("@/features/user/services/educationApiCalls", () => ({
   useUpdateEducationMutation: () => [mutations.education, { isLoading: false }]
}))
vi.mock("@/features/user/services/projectApiCalls", () => ({
   useUpdateProjectMutation: () => [mutations.project, { isLoading: false }]
}))
vi.mock("@/features/user/services/certificationApiCalls", () => ({
   useUpdateCertificationMutation: () => [mutations.certificate, { isLoading: false }]
}))
vi.mock("@/features/user/services/skillApiCalls", () => ({
   useUpdateSkillsMutation: () => [mutations.skills, { isLoading: false }]
}))
vi.mock("@/features/user/services/professionalProfileApiCalls", () => ({
   useUpdateProfessionalProfileMutation: () => [mutations.profile, { isLoading: false }]
}))
vi.mock("@/features/user/services/languageApiCalls", () => ({
   useUpdateUserLanguageMutation: () => [mutations.language, { isLoading: false }]
}))
vi.mock("@/utils/swal", () => ({ showAlert: vi.fn() }))

const createStore = () =>
   configureStore({
      reducer: (state = { auth: { user: { id: "user-1" } } }) => state
   })

type ProfileFormType =
   | "professionalProfile"
   | "skill"
   | "language"
   | "education"
   | "experience"
   | "project"
   | "certificate"

const renderForm = (formType: ProfileFormType, data: Record<string, unknown>) => {
   const onSave = vi.fn()
   const onCancel = vi.fn()
   render(
      <Provider store={createStore()}>
         <ProfileEditForm
            data={data}
            formType={formType}
            onCancel={onCancel}
            onSave={onSave}
         />
      </Provider>
   )
   return { onSave, onCancel }
}

const resolvedMutation = () => ({ unwrap: () => Promise.resolve({}) })

describe("ProfileEditForm characterization", () => {
   beforeEach(() => {
      Object.values(mutations).forEach(mutation =>
         mutation.mockImplementation(resolvedMutation)
      )
   })

   it.each([
      {
         mode: "experience",
         data: { id: "exp-1", companyName: "Old Co", position: "Engineer" },
         label: "Company Name",
         value: "New Co",
         mutation: "experience",
         expected: {
            userId: "user-1",
            id: "exp-1",
            data: { id: "exp-1", companyName: "New Co", position: "Engineer" }
         }
      },
      {
         mode: "education",
         data: { id: "edu-1", university: "Old University", degree: "BS" },
         label: "University",
         value: "New University",
         mutation: "education",
         expected: {
            userId: "user-1",
            id: "edu-1",
            data: { id: "edu-1", university: "New University", degree: "BS" }
         }
      },
      {
         mode: "project",
         data: { id: "project-1", title: "Old project", description: "Details" },
         label: "Project Title",
         value: "New project",
         mutation: "project",
         expected: {
            userId: "user-1",
            id: "project-1",
            data: { id: "project-1", title: "New project", description: "Details" }
         }
      },
      {
         mode: "certificate",
         data: { id: "cert-1", certificateName: "Old certificate", organization: "Org" },
         label: "Certificate Name",
         value: "New certificate",
         mutation: "certificate",
         expected: {
            userId: "user-1",
            id: "cert-1",
            data: {
               id: "cert-1",
               certificateName: "New certificate",
               organization: "Org"
            }
         }
      },
      {
         mode: "professionalProfile",
         data: { jobTitle: "Old title", summary: "Summary", yearsOfExperience: 2 },
         label: "Job Title",
         value: "New title",
         mutation: "profile",
         expected: {
            userId: "user-1",
            data: {
               jobTitle: "New title",
               summary: "Summary",
               yearsOfExperience: 2,
               cvPath: undefined
            }
         }
      }
   ])(
      "submits the current $mode draft through its existing mutation",
      async ({ mode, data, label, value, mutation, expected }) => {
         const { onSave } = renderForm(mode, data)

         fireEvent.change(screen.getByRole("textbox", { name: label }), {
            target: { value }
         })
         fireEvent.click(screen.getByRole("button", { name: "Update" }))

         await waitFor(() => expect(mutations[mutation]).toHaveBeenCalledOnce())
         expect(mutations[mutation]).toHaveBeenCalledWith(expected)
         expect(onSave).toHaveBeenCalledOnce()
      }
   )

   it("replaces only the edited skill in the submitted skill list", async () => {
      const user = userEvent.setup()
      const { onSave } = renderForm("skill", {
         allSkills: ["React", "TypeScript"],
         originalSkill: "React",
         skillName: "React"
      })

      await user.clear(screen.getByRole("textbox", { name: "Skill Name" }))
      await user.type(screen.getByRole("textbox", { name: "Skill Name" }), "Next.js")
      await user.click(screen.getByRole("button", { name: "Update" }))

      await waitFor(() => expect(mutations.skills).toHaveBeenCalledOnce())
      expect(mutations.skills).toHaveBeenCalledWith({
         userId: "user-1",
         skills: ["Next.js", "TypeScript"]
      })
      expect(onSave).toHaveBeenCalledOnce()
   })

   it("submits the selected language level with the existing language id", async () => {
      const user = userEvent.setup()
      const { onSave } = renderForm("language", {
         id: "language-1",
         level: "BEGINNER"
      })

      await user.click(screen.getByRole("combobox"))
      await user.click(within(screen.getByRole("listbox")).getByRole("option", {
         name: "ADVANCED"
      }))
      await user.click(screen.getByRole("button", { name: "Update" }))

      await waitFor(() => expect(mutations.language).toHaveBeenCalledOnce())
      expect(mutations.language).toHaveBeenCalledWith({
         userId: "user-1",
         id: "language-1",
         level: "ADVANCED"
      })
      expect(onSave).toHaveBeenCalledOnce()
   })
})
