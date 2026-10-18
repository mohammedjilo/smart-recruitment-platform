import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"

function SearchHarness({
   value,
   onSubmit
}: {
   value: string
   onSubmit: (value: string) => void
}) {
   const search = useSubmittedSearch(value, onSubmit)

   return (
      <>
         <input
            aria-label="Search"
            value={search.value}
            onChange={search.onChange}
            onKeyDown={search.onKeyDown}
         />
         <button
            type="button"
            onClick={search.submit}>
            Submit search
         </button>
      </>
   )
}

describe("useSubmittedSearch", () => {
   it("keeps typing local until Enter is pressed", () => {
      const onSubmit = vi.fn()
      render(
         <SearchHarness
            value=""
            onSubmit={onSubmit}
         />
      )

      fireEvent.change(screen.getByRole("textbox", { name: "Search" }), {
         target: { value: "frontend" }
      })

      expect(onSubmit).not.toHaveBeenCalled()

      fireEvent.keyDown(screen.getByRole("textbox", { name: "Search" }), {
         key: "Enter"
      })

      expect(onSubmit).toHaveBeenCalledExactlyOnceWith("frontend")
   })

   it("submits by button and resynchronizes when the applied value changes", () => {
      const onSubmit = vi.fn()
      const { rerender } = render(
         <SearchHarness
            value="initial"
            onSubmit={onSubmit}
         />
      )
      const input = screen.getByRole("textbox", { name: "Search" })

      fireEvent.change(input, { target: { value: "next" } })
      fireEvent.click(screen.getByRole("button", { name: "Submit search" }))

      expect(onSubmit).toHaveBeenCalledExactlyOnceWith("next")

      rerender(
         <SearchHarness
            value="applied externally"
            onSubmit={onSubmit}
         />
      )

      expect(input).toHaveValue("applied externally")
   })

   it("does not submit Enter used to confirm IME composition", () => {
      const onSubmit = vi.fn()
      render(
         <SearchHarness
            value=""
            onSubmit={onSubmit}
         />
      )
      const input = screen.getByRole("textbox", { name: "Search" })

      fireEvent.change(input, { target: { value: "検索" } })
      fireEvent.keyDown(input, { key: "Enter", isComposing: true })

      expect(onSubmit).not.toHaveBeenCalled()
   })
})
