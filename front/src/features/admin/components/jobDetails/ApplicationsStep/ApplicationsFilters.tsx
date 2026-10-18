import { FormControl, MenuItem, Select, TextField } from "@mui/material"
import FiltersBar from "@/components/common/FiltersBar"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"
import type { ApplicationStatus } from "@/features/user/components/dashboard/RecentApplicationItem"
import type { ExperienceFilter } from "@/types/admin"

type ApplicationsFiltersProps = {
   search: string

   status: ApplicationStatus | "ALL"

   experience: ExperienceFilter

   onSearchChange: (value: string) => void

   onStatusChange: (value: ApplicationStatus | "ALL") => void

   onExperienceChange: (value: ExperienceFilter) => void
}

const ApplicationsFilters = ({
   search,
   status,
   experience,
   onSearchChange,
   onStatusChange,
   onExperienceChange
}: ApplicationsFiltersProps) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   return (
      <FiltersBar responsiveAt="lg">
         <TextField
            variant="outlined"
            size="small"
            placeholder="Search by name, email or keyword..."
            value={searchInput.value}
            onChange={searchInput.onChange}
            onKeyDown={searchInput.onKeyDown}
            slotProps={{
               input: {
                  startAdornment: (
                     <SearchSubmitAdornment onSearch={searchInput.submit} />
                  )
               }
            }}
            className="w-full lg:max-w-80"
         />

         <FormControl
            size="small"
            className="w-full sm:w-45">
            <Select
               value={status}
               onChange={event =>
                  onStatusChange(event.target.value as ApplicationStatus | "ALL")
               }
               displayEmpty>
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
            size="small"
            className="w-full sm:w-45">
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
