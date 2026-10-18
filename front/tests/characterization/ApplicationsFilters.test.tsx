import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import ApplicationsFilters from "@/features/user/components/application/ApplicationsFilters"

describe("user applications filters", () => {
   it("submits search only on Enter or the search button", () => {
      const onSearchSubmit = vi.fn()
      render(
         <ApplicationsFilters
            search=""
            status="ALL"
            matchScore="ALL"
            sort="newest"
            onSearchSubmit={onSearchSubmit}
            onStatusChange={vi.fn()}
            onMatchScoreChange={vi.fn()}
            onSortChange={vi.fn()}
         />
      )
      const input = screen.getByPlaceholderText("Search job title or company...")

      fireEvent.change(input, { target: { value: "engineer" } })
      expect(onSearchSubmit).not.toHaveBeenCalled()

      fireEvent.keyDown(input, { key: "Enter" })
      expect(onSearchSubmit).toHaveBeenCalledExactlyOnceWith("engineer")

      fireEvent.click(screen.getByRole("button", { name: "Search" }))
      expect(onSearchSubmit).toHaveBeenCalledTimes(2)
   })

   it("submits status, match score, and applied-date sort selections", async () => {
      const user = userEvent.setup()
      const onStatusChange = vi.fn()
      const onMatchScoreChange = vi.fn()
      const onSortChange = vi.fn()
      render(
         <ApplicationsFilters
            search=""
            status="ALL"
            matchScore="ALL"
            sort="newest"
            onSearchSubmit={vi.fn()}
            onStatusChange={onStatusChange}
            onMatchScoreChange={onMatchScoreChange}
            onSortChange={onSortChange}
         />
      )
      const [statusFilter, scoreFilter, sortFilter] = screen.getAllByRole("combobox")

      await user.click(statusFilter)
      await user.click(await screen.findByRole("option", { name: "REVIEWING" }))
      expect(onStatusChange).toHaveBeenCalledWith("REVIEWING")

      await user.click(scoreFilter)
      await user.click(await screen.findByRole("option", { name: "High (85%+)" }))
      expect(onMatchScoreChange).toHaveBeenCalledWith("HIGH")

      await user.click(sortFilter)
      await user.click(await screen.findByRole("option", { name: "Applied: Oldest First" }))
      expect(onSortChange).toHaveBeenCalledWith("oldest")
   })
})
