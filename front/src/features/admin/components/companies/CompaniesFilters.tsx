import { FormControl, MenuItem, Select } from "@mui/material"
import FiltersBar from "@/components/common/FiltersBar"
import CountryCitySelector, {
   type LocationSelection
} from "@/components/common/CountryCitySelector"

type Props = {
   status: "ALL" | "ACTIVE" | "DEACTIVATED"

   approvalStatus: "ALL" | "PENDING" | "APPROVED" | "REJECTED"

   sortByNewest: boolean
   location: LocationSelection

   onStatusChange: (value: "ALL" | "ACTIVE" | "DEACTIVATED") => void

   onApprovalStatusChange: (value: "ALL" | "PENDING" | "APPROVED" | "REJECTED") => void

   onSortChange: (value: boolean) => void
   onLocationChange: (value: LocationSelection) => void
}

const CompaniesFilters = ({
   status,
   approvalStatus,
   sortByNewest,
   location,
   onStatusChange,
   onApprovalStatusChange,
   onSortChange,
   onLocationChange
}: Props) => {
   return (
      <FiltersBar responsiveAt="sm">
         {/* Status */}
         <FormControl
            size="small"
            className="bg-surface w-full sm:w-45">
            <Select
               value={status}
               onChange={event =>
                  onStatusChange(event.target.value as "ALL" | "ACTIVE" | "DEACTIVATED")
               }>
               <MenuItem value="ALL">All Status</MenuItem>

               <MenuItem value="ACTIVE">Active</MenuItem>

               <MenuItem value="DEACTIVATED">Deactivated</MenuItem>
            </Select>
         </FormControl>

         {/* Approval Status */}
         <FormControl
            size="small"
            className="bg-surface w-full sm:w-52.5">
            <Select
               value={approvalStatus}
               onChange={event =>
                  onApprovalStatusChange(
                     event.target.value as "ALL" | "PENDING" | "APPROVED" | "REJECTED"
                  )
               }>
               <MenuItem value="ALL">All Approval Status</MenuItem>

               <MenuItem value="PENDING">Pending</MenuItem>

               <MenuItem value="APPROVED">Approved</MenuItem>

               <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
         </FormControl>

         {/* Sort */}
         <FormControl
            size="small"
            className="bg-surface w-full sm:w-47.5">
            <Select
               value={sortByNewest ? "NEWEST" : "OLDEST"}
               onChange={event => onSortChange(event.target.value === "NEWEST")}>
               <MenuItem value="NEWEST">Sort by: Newest</MenuItem>

               <MenuItem value="OLDEST">Sort by: Oldest</MenuItem>
            </Select>
         </FormControl>

         <CountryCitySelector value={location} onChange={onLocationChange} />
      </FiltersBar>
   )
}

export default CompaniesFilters
