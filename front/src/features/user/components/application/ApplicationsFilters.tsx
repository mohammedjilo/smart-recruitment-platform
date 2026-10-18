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
   | "UNSCORED"

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
   ["ALL", "HIGH", "GOOD", "FAIR", "LOW", "UNSCORED"].some(
      matchScore => matchScore === value
   )

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
            size="small"
            value={searchInput.value}
            onChange={searchInput.onChange}
            onKeyDown={searchInput.onKeyDown}
            placeholder="Search job title or company..."
            className="w-full xl:flex-1"
            slotProps={{
               input: {
                  startAdornment: (
                     <SearchSubmitAdornment onSearch={searchInput.submit} />
                  )
               }
            }}
         />

         <FormControl
            size="small"
            className="w-full xl:w-45">
            <Select
               value={status}
               onChange={event =>
                  onStatusChange(event.target.value as ApplicationStatus | "ALL")
               }
               displayEmpty>
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
            size="small"
            className="w-full xl:w-55">
            <Select
               value={matchScore}
               onChange={event =>
                  onMatchScoreChange(event.target.value as ApplicationMatchScore)
               }
               displayEmpty>
               <MenuItem value="ALL">All Match Scores</MenuItem>
               <MenuItem value="HIGH">High (85%+)</MenuItem>
               <MenuItem value="GOOD">Good (70-84%)</MenuItem>
               <MenuItem value="FAIR">Fair (50-69%)</MenuItem>
               <MenuItem value="LOW">Low (under 50%)</MenuItem>
               <MenuItem value="UNSCORED">No Score</MenuItem>
            </Select>
         </FormControl>

         <FormControl
            size="small"
            className="w-full xl:w-47.5">
            <Select
               value={sort}
               onChange={event => onSortChange(event.target.value as ApplicationSort)}
               displayEmpty
               startAdornment={
                  <InputAdornment position="start">
                     <CalendarMonthOutlinedIcon fontSize="small" />
                  </InputAdornment>
               }>
               <MenuItem value="newest">Applied: Newest First</MenuItem>
               <MenuItem value="oldest">Applied: Oldest First</MenuItem>
            </Select>
         </FormControl>
      </FiltersBar>
   )
}
