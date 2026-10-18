import {
   FormControl,
   MenuItem,
   OutlinedInput,
   Select
} from "@mui/material"
import FiltersBar from "@/components/common/FiltersBar"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"
import type { EmploymentType, JobStatus } from "@/types/job"

type JobsFiltersProps = {
   search: string

   status: "ALL" | JobStatus

   employmentType: "ALL" | EmploymentType

   onSearchChange: (value: string) => void

   onStatusChange: (value: "ALL" | JobStatus) => void

   onEmploymentTypeChange: (value: "ALL" | EmploymentType) => void
}

const statusOptions = [
   {
      value: "ALL",
      label: "All Status"
   },
   {
      value: "OPEN",
      label: "Open"
   },
   {
      value: "CLOSED",
      label: "Closed"
   },
   {
      value: "EXPIRED",
      label: "Expired"
   }
]

const employmentTypeOptions = [
   {
      value: "ALL",
      label: "All Employment Types"
   },
   {
      value: "FULL_TIME",
      label: "Full Time"
   },
   {
      value: "PART_TIME",
      label: "Part Time"
   },
   {
      value: "CONTRACT",
      label: "Contract"
   },
   {
      value: "INTERNSHIP",
      label: "Internship"
   },
   {
      value: "FREELANCE",
      label: "Freelance"
   },
   {
      value: "REMOTE",
      label: "Remote"
   }
]

const JobsFilters = ({
   search,
   status,
   employmentType,
   onSearchChange,
   onStatusChange,
   onEmploymentTypeChange
}: JobsFiltersProps) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   return (
      <FiltersBar>
         <OutlinedInput
            fullWidth
            size="small"
            value={searchInput.value}
            placeholder="Search by job title..."
            onChange={searchInput.onChange}
            onKeyDown={searchInput.onKeyDown}
            startAdornment={
               <SearchSubmitAdornment onSearch={searchInput.submit} />
            }
            className="bg-surface md:max-w-75"
         />

         <FormControl
            size="small"
            className="w-full md:w-57.5">
            <Select
               value={employmentType}
               className="bg-surface"
               onChange={event =>
                  onEmploymentTypeChange(event.target.value as "ALL" | EmploymentType)
               }>
               {employmentTypeOptions.map(option => (
                  <MenuItem
                     key={option.value}
                     value={option.value}>
                     {option.label}
                  </MenuItem>
               ))}
            </Select>
         </FormControl>

         <FormControl
            size="small"
            className="w-full md:w-45">
            <Select
               value={status}
               className="bg-surface"
               onChange={event =>
                  onStatusChange(event.target.value as "ALL" | JobStatus)
               }>
               {statusOptions.map(option => (
                  <MenuItem
                     key={option.value}
                     value={option.value}>
                     {option.label}
                  </MenuItem>
               ))}
            </Select>
         </FormControl>
      </FiltersBar>
   )
}

export default JobsFilters
