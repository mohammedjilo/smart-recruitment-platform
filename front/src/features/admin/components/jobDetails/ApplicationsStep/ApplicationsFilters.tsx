import { FormControl, MenuItem, Select, TextField } from "@mui/material"
import FiltersBar from "@/components/common/FiltersBar"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"
import type { ApplicationStatus } from "@/features/user/components/dashboard/RecentApplicationItem"
import type { ExperienceFilter } from "@/types/admin"
import type { ApplicationMatchScore } from "@/types/application"

type ApplicationsFiltersProps = {
   search: string

   status: ApplicationStatus | "ALL"

   experience: ExperienceFilter
   matchScore: ApplicationMatchScore

   onSearchChange: (value: string) => void

   onStatusChange: (value: ApplicationStatus | "ALL") => void

   onExperienceChange: (value: ExperienceFilter) => void
   onMatchScoreChange: (value: ApplicationMatchScore) => void
}

const ApplicationsFilters = ({
   search,
   status,
   experience,
   matchScore,
   onSearchChange,
   onStatusChange,
   onExperienceChange,
   onMatchScoreChange
}: ApplicationsFiltersProps) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   return (
      <FiltersBar responsiveAt="lg">
         <TextField
            className="w-full lg:max-w-80"
            placeholder="Search by name, email or keyword..."
            value={searchInput.value}
            size="small"
            slotProps={{
               input: {
                  startAdornment: (
                     <SearchSubmitAdornment onSearch={searchInput.submit} />
                  )
               }
            }}
            variant="outlined"
            onChange={searchInput.onChange}
            onKeyDown={searchInput.onKeyDown}
         />

         <FormControl
            className="w-full sm:w-45"
            size="small">
            <Select
               value={status}
               displayEmpty
               onChange={event =>
                  onStatusChange(event.target.value as ApplicationStatus | "ALL")
               }>
               <MenuItem value="ALL">All Status</MenuItem>

               <MenuItem value="PENDING">Pending</MenuItem>

               <MenuItem value="REVIEWING">Reviewing</MenuItem>

               <MenuItem value="SHORTLISTED">Shortlisted</MenuItem>

               <MenuItem value="INTERVIEW">Interview</MenuItem>

               <MenuItem value="ACCEPTED">Accepted</MenuItem>

               <MenuItem value="REJECTED">Rejected</MenuItem>

               <MenuItem value="WITHDRAWN">Withdrawn</MenuItem>
            </Select>
         </FormControl>

         <FormControl
            className="w-full sm:w-45"
            size="small">
            <Select
               value={matchScore}
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
            className="w-full sm:w-45"
            size="small">
            <Select
               value={experience}
               onChange={event =>
                  onExperienceChange(event.target.value as ExperienceFilter)
               }>
               <MenuItem value="ALL">All Experience</MenuItem>

               <MenuItem value="0-2">0 - 2 years</MenuItem>

               <MenuItem value="3-5">3 - 5 years</MenuItem>

               <MenuItem value="6+">6+ years</MenuItem>
            </Select>
         </FormControl>
      </FiltersBar>
   )
}

export default ApplicationsFilters
