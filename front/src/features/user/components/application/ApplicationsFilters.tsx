import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import { FormControl, InputAdornment, MenuItem, Select, TextField } from "@mui/material"
import FiltersBar from "@/components/common/FiltersBar"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"
import type { ApplicationStatus } from "@/types/common/enums"

export type ApplicationMatchScore =
   | "ALL"
   | "HIGH"
   | "GOOD"
   | "FAIR"
   | "LOW"

export type ApplicationSort = "newest" | "oldest"

const applicationStatuses: ApplicationStatus[] = [
   "PENDING",
   "REVIEWING",
   "SHORTLISTED",
   "INTERVIEW",
   "ACCEPTED",
   "REJECTED",
   "WITHDRAWN"
]

export const isApplicationStatus = (value: string): value is ApplicationStatus =>
   applicationStatuses.some(status => status === value)

export const isApplicationMatchScore = (value: string): value is ApplicationMatchScore =>
   ["ALL", "HIGH", "GOOD", "FAIR", "LOW"].some(matchScore => matchScore === value)

type ApplicationsFiltersProps = {
   search: string
   status: ApplicationStatus | "ALL"
   matchScore: ApplicationMatchScore
   sort: ApplicationSort
   onSearchSubmit: (value: string) => void
   onStatusChange: (value: ApplicationStatus | "ALL") => void
   onMatchScoreChange: (value: ApplicationMatchScore) => void
   onSortChange: (value: ApplicationSort) => void
}

export default function ApplicationsFilters({
   search,
   status,
   matchScore,
   sort,
   onSearchSubmit,
   onStatusChange,
   onMatchScoreChange,
   onSortChange
}: ApplicationsFiltersProps) {
   const searchInput = useSubmittedSearch(search, onSearchSubmit)

   return (
      <FiltersBar
         responsiveAt="xl">
         <TextField
            className="w-full xl:flex-1"
            placeholder="Search job title or company..."
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
            className="w-full xl:w-45"
            size="small">
            <Select
               value={status}
               displayEmpty
               onChange={event =>
                  onStatusChange(event.target.value as ApplicationStatus | "ALL")
               }>
               <MenuItem value="ALL">All Status</MenuItem>
               {applicationStatuses.map(applicationStatus => (
                  <MenuItem
                     key={applicationStatus}
                     value={applicationStatus}>
                     {applicationStatus.replaceAll("_", " ")}
                  </MenuItem>
               ))}
            </Select>
         </FormControl>

         <FormControl
            className="w-full xl:w-55"
            size="small">
            <Select
               value={matchScore}
               displayEmpty
               onChange={event =>
                  onMatchScoreChange(event.target.value as ApplicationMatchScore)
               }>
               <MenuItem value="ALL">All Match Scores</MenuItem>
               <MenuItem value="HIGH">High (85%+)</MenuItem>
               <MenuItem value="GOOD">Good (70-84%)</MenuItem>
               <MenuItem value="FAIR">Fair (50-69%)</MenuItem>
               <MenuItem value="LOW">Low (under 50%)</MenuItem>
            </Select>
         </FormControl>

         <FormControl
            className="w-full xl:w-47.5"
            size="small">
            <Select
               value={sort}
               displayEmpty
               startAdornment={
                  <InputAdornment position="start">
                     <CalendarMonthOutlinedIcon fontSize="small" />
                  </InputAdornment>
               }
               onChange={event => onSortChange(event.target.value as ApplicationSort)}>
               <MenuItem value="newest">Applied: Newest First</MenuItem>
               <MenuItem value="oldest">Applied: Oldest First</MenuItem>
            </Select>
         </FormControl>
      </FiltersBar>
   )
}
