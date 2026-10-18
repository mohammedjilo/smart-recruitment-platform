import { Box, MenuItem, Select, type SelectChangeEvent, Typography } from "@mui/material"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"

import FiltersBar from "@/components/common/FiltersBar"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"
import type { JobStatus } from "@/types/user"

type Props = {
   search: string
   status: JobStatus | "ALL"
   onSearchChange: (value: string) => void
   onStatusChange: (value: JobStatus | "ALL") => void
}

const CompanyJobsFilters = ({
   search,
   status,
   onSearchChange,
   onStatusChange
}: Props) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   const handleStatusChange = (event: SelectChangeEvent<string>) => {
      onStatusChange(event.target.value as JobStatus | "ALL")
   }

   return (
      <FiltersBar
         responsiveAt="sm"
         className="justify-between">
         {/* Search */}
         <Box className="relative w-full sm:max-w-105">
            <input
               value={searchInput.value}
               onChange={searchInput.onChange}
               onKeyDown={searchInput.onKeyDown}
               placeholder="Search jobs..."
               className="border-border bg-surface text-content placeholder:text-muted focus:border-primary focus:ring-primary/20 h-11 w-full rounded-lg border pr-4 pl-11 text-sm transition outline-none focus:ring-2"
            />
            <button
               type="button"
               aria-label="Search"
               onClick={searchInput.submit}
               className="text-muted hover:text-primary absolute top-1/2 left-3 -translate-y-1/2 rounded p-1"
            >
               <SearchOutlinedIcon sx={{ fontSize: 20 }} />
            </button>
         </Box>

         {/* Job Status */}
         <Box className="flex items-center gap-3">
            <Typography
               component="span"
               className="shrink-0 text-sm font-medium"
               color="textSecondary">
               Job Status
            </Typography>

            <Select
               value={status}
               onChange={handleStatusChange}
               className="bg-surface h-11 min-w-37.5 rounded-lg text-sm"
               sx={{
                  "& .MuiSelect-select": {
                     paddingTop: "10px",
                     paddingBottom: "10px"
                  },

                  "& .MuiOutlinedInput-notchedOutline": {
                     borderColor: "#e2e8f0"
                  },

                  "&:hover .MuiOutlinedInput-notchedOutline": {
                     borderColor: "#cbd5e1"
                  },

                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                     borderColor: "#a78bfa"
                  }
               }}>
               <MenuItem value="ALL">All Statuses</MenuItem>

               <MenuItem value="OPEN">Open</MenuItem>

               <MenuItem value="CLOSED">Closed</MenuItem>

               <MenuItem value="EXPIRED">Expired</MenuItem>
            </Select>
         </Box>
      </FiltersBar>
   )
}

export default CompanyJobsFilters
