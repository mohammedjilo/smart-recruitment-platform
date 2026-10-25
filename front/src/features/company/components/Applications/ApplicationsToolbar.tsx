import React from "react"

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"

import {
   FormControl,
   InputAdornment,
   MenuItem,
   Select,
   TextField,
   type SelectChangeEvent
} from "@mui/material"
import FiltersBar from "@/components/common/FiltersBar"
import type { ApplicationStatus } from "@/features/user/components/dashboard/RecentApplicationItem"
import type { ApplicationMatchScore } from "@/types/application"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"

interface ApplicationsToolbarProps {
   search: string
   status: ApplicationStatus | "ALL"
   matchScore: ApplicationMatchScore
   sort: "newest" | "oldest"

   onSearchChange: (value: string) => void
   onStatusChange: (value: ApplicationStatus | "ALL") => void
   onMatchScoreChange: (value: ApplicationMatchScore) => void
   onSortChange: (value: "newest" | "oldest") => void
}

const ApplicationsToolbar: React.FC<ApplicationsToolbarProps> = ({
   search,
   status,
   matchScore,
   sort,
   onSearchChange,
   onStatusChange,
   onMatchScoreChange,
   onSortChange
}) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   const handleStatus = (event: SelectChangeEvent) => {
      onStatusChange(event.target.value as ApplicationStatus | "ALL")
   }

   const handleSort = (event: SelectChangeEvent) => {
      onSortChange(event.target.value as "newest" | "oldest")
   }
   const handleMatchScore = (event: SelectChangeEvent) => {
      onMatchScoreChange(event.target.value as ApplicationMatchScore)
   }
   return (
      <FiltersBar>
         {/* Search */}
         <TextField
            className="w-full md:max-w-77.5"
            placeholder="Search by name, email or job title..."
            value={searchInput.value}
            size="small"
            slotProps={{
               input: {
                  startAdornment: <SearchSubmitAdornment onSearch={searchInput.submit} />
               }
            }}
            sx={{
               "& .MuiOutlinedInput-root": {
                  height: 44,
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  fontSize: "14px",
                  fontWeight: 500
               },
               "& .MuiInputBase-input": {
                  fontSize: "14px",
                  fontWeight: 500
               }
            }}
            onChange={searchInput.onChange}
            onKeyDown={searchInput.onKeyDown}
         />

         {/* Status */}
         <FormControl
            className="w-full md:w-45"
            size="small"
            sx={{
               "& .MuiOutlinedInput-root": {
                  height: 44,
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  fontSize: "14px",
                  fontWeight: 500
               },
               "& .MuiSelect-select": {
                  fontSize: "14px",
                  fontWeight: 500
               }
            }}>
            <Select
               value={status}
               displayEmpty
               onChange={handleStatus}>
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

         {/* Match score */}
         <FormControl
            className="w-full md:w-45"
            size="small"
            sx={{
               "& .MuiOutlinedInput-root": {
                  height: 44,
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  fontSize: "14px",
                  fontWeight: 500
               },
               "& .MuiSelect-select": {
                  fontSize: "14px",
                  fontWeight: 500
               }
            }}>
            <Select
               value={matchScore}
               displayEmpty
               onChange={handleMatchScore}>
               <MenuItem value="ALL">All Match Scores</MenuItem>
               <MenuItem value="HIGH">High (85%+)</MenuItem>
               <MenuItem value="GOOD">Good (70-84%)</MenuItem>
               <MenuItem value="FAIR">Fair (50-69%)</MenuItem>
               <MenuItem value="LOW">Low (under 50%)</MenuItem>
            </Select>
         </FormControl>

         {/* Sort */}
         <FormControl
            className="w-full md:ml-auto md:w-42.5"
            size="small"
            sx={{
               "& .MuiOutlinedInput-root": {
                  height: 44,
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  fontSize: "14px",
                  fontWeight: 500
               },
               "& .MuiSelect-select": {
                  fontSize: "14px",
                  fontWeight: 500
               }
            }}>
            <Select
               value={sort}
               displayEmpty
               startAdornment={
                  <InputAdornment position="start">
                     <CalendarMonthOutlinedIcon className="text-lg! text-[#64748b]!" />
                  </InputAdornment>
               }
               onChange={handleSort}>
               <MenuItem value="newest">Newest First</MenuItem>
               <MenuItem value="oldest">Oldest First</MenuItem>
            </Select>
         </FormControl>
      </FiltersBar>
   )
}

export default ApplicationsToolbar
