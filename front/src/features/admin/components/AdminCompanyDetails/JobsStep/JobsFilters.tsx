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
      <FiltersBar responsiveAt="lg">
         <OutlinedInput
            fullWidth
            value={searchInput.value}
            onChange={searchInput.onChange}
            onKeyDown={searchInput.onKeyDown}
            placeholder="Search jobs by title..."
            size="small"
            startAdornment={
               <SearchSubmitAdornment onSearch={searchInput.submit} />
            }
            className="bg-surface lg:max-w-70"
         />

         <FormControl
            size="small"
            className="w-full lg:w-47.5">
            <Select
               value={status}
               onChange={event => onStatusChange(event.target.value as "ALL" | JobStatus)}
               className="bg-surface">
               {statusOptions.map(option => (
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
            className="w-full lg:w-57.5">
            <Select
               value={employmentType}
               onChange={event =>
                  onEmploymentTypeChange(event.target.value as "ALL" | EmploymentType)
               }
               className="bg-surface">
               {employmentTypeOptions.map(option => (
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
