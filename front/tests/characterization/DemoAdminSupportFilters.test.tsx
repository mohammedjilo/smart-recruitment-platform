import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import SupportFilters from "@/features/admin/components/support/SupportFilters"

const renderFilters = (hideAssignedAdmin: boolean) =>
   render(
      <SupportFilters
         admins={[]}
         assignedAdminId="ALL"
         audience="ALL"
         categories={[]}
         categoryId="ALL"
         hideAssignedAdmin={hideAssignedAdmin}
         isLoadingAdmins={false}
         isLoadingCategories={false}
         priority="ALL"
         search=""
         status="ALL"
         onAssignedAdminChange={() => undefined}
         onAudienceChange={() => undefined}
         onCategoryChange={() => undefined}
         onPriorityChange={() => undefined}
         onSearchChange={() => undefined}
         onStatusChange={() => undefined}
      />
   )

describe("Demo Admin support filters", () => {
   it("hides Assigned Admin when requested", () => {
      renderFilters(true)
      expect(screen.queryAllByText("Assigned Admin")).toHaveLength(0)
      expect(screen.queryAllByText("Status").length).toBeGreaterThan(0)
   })

   it("preserves Assigned Admin for other admin roles", () => {
      renderFilters(false)
      expect(screen.queryAllByText("Assigned Admin").length).toBeGreaterThan(0)
   })
})
