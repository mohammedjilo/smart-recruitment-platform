import { MenuItem, TextField } from "@mui/material"
import FiltersBar from "@/components/common/FiltersBar"
import type { EmploymentType } from "@/types/job"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"

const employmentTypeValues: EmploymentType[] = [
   "FULL_TIME",
   "PART_TIME",
   "CONTRACT",
   "INTERNSHIP",
   "FREELANCE",
   "REMOTE"
]

export const isEmploymentType = (value: string): value is EmploymentType =>
   employmentTypeValues.some(employmentType => employmentType === value)

const employmentTypes: Array<{ value: EmploymentType; label: string }> = [
   { value: "FULL_TIME", label: "Full time" },
   { value: "PART_TIME", label: "Part time" },
   { value: "CONTRACT", label: "Contract" },
   { value: "INTERNSHIP", label: "Internship" },
   { value: "FREELANCE", label: "Freelance" },
   { value: "REMOTE", label: "Remote" }
]

type JobsFiltersProps = {
   search: string
   employmentType: EmploymentType | ""
   onSearchChange: (value: string) => void
   onSearchSubmit: () => void
   onEmploymentTypeChange: (value: EmploymentType | "") => void
}

export default function JobsFilters({
   search,
   employmentType,
   onSearchChange,
   onSearchSubmit,
   onEmploymentTypeChange
}: JobsFiltersProps) {
   return (
      <FiltersBar>
         <TextField
            className="w-full sm:max-w-120"
            placeholder="Search company, job, or skill..."
            value={search}
            size="small"
            slotProps={{
               input: {
                  startAdornment: <SearchSubmitAdornment onSearch={onSearchSubmit} />
               }
            }}
            onChange={event => onSearchChange(event.target.value)}
            onKeyDown={event => {
               if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  onSearchSubmit()
               }
            }}
         />
         <TextField
            className="w-full sm:max-w-60"
            value={employmentType || "ALL"}
            label="Employment type"
            select
            size="small"
            onChange={event =>
               onEmploymentTypeChange(
                  event.target.value === "ALL"
                     ? ""
                     : (event.target.value as EmploymentType)
               )
            }>
            <MenuItem value="ALL">All employment types</MenuItem>
            {employmentTypes.map(type => (
               <MenuItem
                  key={type.value}
                  value={type.value}>
                  {type.label}
               </MenuItem>
            ))}
         </TextField>
      </FiltersBar>
   )
}
