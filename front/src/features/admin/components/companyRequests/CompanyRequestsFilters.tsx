import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import { FormControl, InputAdornment, MenuItem, Select, TextField } from "@mui/material"
import FiltersBar from "@/components/common/FiltersBar"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"

type CompanyRequestsFiltersProps = {
   search: string
   approvalStatus: string
   status: string
   requestDate: string

   onSearchChange: (value: string) => void
   onApprovalStatusChange: (value: string) => void
   onStatusChange: (value: string) => void
   onRequestDateChange: (value: string) => void
}

const CompanyRequestsFilters = ({
   search,
   approvalStatus,
   status,
   requestDate,
   onSearchChange,
   onApprovalStatusChange,
   onStatusChange,
   onRequestDateChange
}: CompanyRequestsFiltersProps) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   return (
      <FiltersBar responsiveAt="lg">
         <TextField
            className="bg-surface w-full lg:max-w-77.5"
            placeholder="Search by company name or email..."
            value={searchInput.value}
            size="small"
            slotProps={{
               input: {
                  startAdornment: (
                     <SearchSubmitAdornment onSearch={searchInput.submit} />
                  )
               }
            }}
            onChange={searchInput.onChange}
            onKeyDown={searchInput.onKeyDown}
         />

         <FormControl
            className="bg-surface w-full lg:w-47.5"
            size="small">
            <Select
               value={approvalStatus}
               onChange={event => onApprovalStatusChange(event.target.value)}>
               <MenuItem value="ALL">All Approval Status</MenuItem>

               <MenuItem value="PENDING">Pending</MenuItem>

               <MenuItem value="APPROVED">Approved</MenuItem>

               <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
         </FormControl>

         <FormControl
            className="bg-surface w-full lg:w-37.5"
            size="small">
            <Select
               value={status}
               onChange={event => onStatusChange(event.target.value)}>
               <MenuItem value="ALL">All Status</MenuItem>

               <MenuItem value="ACTIVE">Active</MenuItem>

               <MenuItem value="DEACTIVATED">Deactivated</MenuItem>
            </Select>
         </FormControl>

         <TextField
            className="bg-surface w-full lg:w-45"
            type="date"
            value={requestDate}
            size="small"
            slotProps={{
               input: {
                  startAdornment: (
                     <InputAdornment position="start">
                        <CalendarMonthOutlinedIcon
                           className="text-muted mr-2"
                           fontSize="small"
                        />
                     </InputAdornment>
                  )
               }
            }}
            onChange={event => onRequestDateChange(event.target.value)}
         />
      </FiltersBar>
   )
}

export default CompanyRequestsFilters
