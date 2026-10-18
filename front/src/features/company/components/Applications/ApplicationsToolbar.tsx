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
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"

interface ApplicationsToolbarProps {
   search: string
   status: ApplicationStatus | "ALL"
   sort: "newest" | "oldest"

   onSearchChange: (value: string) => void
   onStatusChange: (value: ApplicationStatus | "ALL") => void
   onSortChange: (value: "newest" | "oldest") => void
}

const ApplicationsToolbar: React.FC<ApplicationsToolbarProps> = ({
   search,
   status,
   sort,
   onSearchChange,
   onStatusChange,
   onSortChange
}) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   const handleStatus = (event: SelectChangeEvent) => {
      onStatusChange(event.target.value as ApplicationStatus | "ALL")
   }

   const handleSort = (event: SelectChangeEvent) => {
      onSortChange(event.target.value as "newest" | "oldest")
   }
   return (
      <FiltersBar>
         {/* Search */}
         <TextField
            size="small"
            value={searchInput.value}
            onChange={searchInput.onChange}
            onKeyDown={searchInput.onKeyDown}
            placeholder="Search by name, email or job title..."
            className="w-full md:max-w-77.5"
            slotProps={{
               input: {
                  startAdornment: (
                     <SearchSubmitAdornment onSearch={searchInput.submit} />
                  )
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
         />

         {/* Status */}
         <FormControl
            size="small"
            className="w-full md:w-45"
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
               onChange={handleStatus}
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

         {/* Sort */}
         <FormControl
            size="small"
            className="w-full md:ml-auto md:w-42.5"
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
               onChange={handleSort}
               displayEmpty
               startAdornment={
                  <InputAdornment position="start">
                     <CalendarMonthOutlinedIcon
                        sx={{
                           fontSize: 18,
                           color: "#64748b"
                        }}
                     />
                  </InputAdornment>
               }>
               <MenuItem value="newest">Newest First</MenuItem>
               <MenuItem value="oldest">Oldest First</MenuItem>
            </Select>
         </FormControl>
      </FiltersBar>
   )
}

export default ApplicationsToolbar
