import { MenuItem, TextField } from "@mui/material"
import FiltersBar from "@/components/common/FiltersBar"

import type { ApplicationStatus } from "@/features/user/components/dashboard/RecentApplicationItem"
import type { ApplicationMatchScore } from "@/types/application"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"

type ApplicationsFiltersProps = {
   search: string
   status: ApplicationStatus | "ALL"
   matchScore: ApplicationMatchScore

   onSearchChange: (value: string) => void

   onStatusChange: (value: ApplicationStatus | "ALL") => void
   onMatchScoreChange: (value: ApplicationMatchScore) => void
}

const ApplicationsFilters = ({
   search,
   status,
   matchScore,
   onSearchChange,
   onStatusChange,
   onMatchScoreChange
}: ApplicationsFiltersProps) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   return (
      <FiltersBar>
         <TextField
            className="bg-surface! md:max-w-90"
            placeholder="Search by applicant name, email or job title..."
            value={searchInput.value}
            fullWidth
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

         <TextField
            className="bg-surface! w-full md:w-55"
            value={status}
            select
            size="small"
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
         </TextField>

         <TextField
            className="bg-surface! w-full md:w-55"
            value={matchScore}
            select
            size="small"
            onChange={event =>
               onMatchScoreChange(event.target.value as ApplicationMatchScore)
            }>
            <MenuItem value="ALL">All Match Scores</MenuItem>
            <MenuItem value="HIGH">High (85%+)</MenuItem>
            <MenuItem value="GOOD">Good (70-84%)</MenuItem>
            <MenuItem value="FAIR">Fair (50-69%)</MenuItem>
            <MenuItem value="LOW">Low (under 50%)</MenuItem>
         </TextField>
      </FiltersBar>
   )
}

export default ApplicationsFilters
