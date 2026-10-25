import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import JobsFilters from "@/features/user/components/jobs/JobsFilters"

describe("user jobs filters", () => {
   it("submits search only on Enter or the search button", () => {
      const onSearchChange = vi.fn()
      const onSearchSubmit = vi.fn()
      render(
         <JobsFilters
            employmentType=""
            search=""
            onEmploymentTypeChange={vi.fn()}
            onSearchChange={onSearchChange}
            onSearchSubmit={onSearchSubmit}
         />
      )
      const input = screen.getByPlaceholderText("Search company, job, or skill...")

      fireEvent.change(input, { target: { value: "engineer" } })
      expect(onSearchChange).toHaveBeenCalledWith("engineer")
      expect(onSearchSubmit).not.toHaveBeenCalled()

      fireEvent.keyDown(input, { key: "Enter" })
      expect(onSearchSubmit).toHaveBeenCalledTimes(1)

      fireEvent.click(screen.getByRole("button", { name: "Search" }))
      expect(onSearchSubmit).toHaveBeenCalledTimes(2)
   })

   it("emits a selected employment type and supports clearing it", async () => {
      const user = userEvent.setup()
      const onEmploymentTypeChange = vi.fn()
      const props = {
         search: "",
         onSearchChange: vi.fn(),
         onSearchSubmit: vi.fn(),
         onEmploymentTypeChange
      }
      const { rerender } = render(
         <JobsFilters
            employmentType=""
            {...props}
         />
      )

      await user.click(screen.getByRole("combobox", { name: "Employment type" }))
      await user.click(await screen.findByRole("option", { name: "Remote" }))
      expect(onEmploymentTypeChange).toHaveBeenCalledWith("REMOTE")

      rerender(
         <JobsFilters
            employmentType="REMOTE"
            {...props}
         />
      )
      await user.click(screen.getByRole("combobox", { name: "Employment type" }))
      await user.click(await screen.findByRole("option", { name: "All employment types" }))
      expect(onEmploymentTypeChange).toHaveBeenLastCalledWith("")
   })
})
