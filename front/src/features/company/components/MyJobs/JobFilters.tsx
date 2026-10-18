import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import {
   FormControl,
   MenuItem,
   Select,
   TextField,
   InputAdornment,
   type SelectChangeEvent
} from "@mui/material"
import FiltersBar from "@/components/common/FiltersBar"
import type { EmploymentType, JobStatus } from "@/types/createJob.types"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"

type JobFiltersProps = {
   search: string
   status: JobStatus | "ALL"
   employmentType: EmploymentType | "ALL"
   sort: "newest" | "oldest"

   onSearchChange: (value: string) => void
   onStatusChange: (value: JobStatus | "ALL") => void
   onEmploymentTypeChange: (value: EmploymentType | "ALL") => void
   onSortChange: (value: "newest" | "oldest") => void
}

const JobFilters = ({
   search,
   status,
   employmentType,
   sort,
   onSearchChange,
   onStatusChange,
   onEmploymentTypeChange,
   onSortChange
}: JobFiltersProps) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   const handleStatus = (event: SelectChangeEvent) => {
      onStatusChange(event.target.value as JobStatus | "ALL")
   }

   const handleEmploymentType = (event: SelectChangeEvent) => {
      onEmploymentTypeChange(event.target.value as EmploymentType | "ALL")
   }

   const handleSort = (event: SelectChangeEvent) => {
      onSortChange(event.target.value as "newest" | "oldest")
   }

   return (
      <FiltersBar responsiveAt="xl">
         {/* Search */}
         <TextField
            value={searchInput.value}
            onChange={searchInput.onChange}
            onKeyDown={searchInput.onKeyDown}
            placeholder="Search jobs by title..."
            size="small"
            className="xl:flex-1"
            sx={{
               minWidth: 260,
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
            slotProps={{
               input: {
                  startAdornment: (
                     <SearchSubmitAdornment onSearch={searchInput.submit} />
                  )
               }
            }}
         />

         {/* Status */}
         <FormControl
            size="small"
            sx={{
               minWidth: 155,
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
               <MenuItem value="OPEN">Open</MenuItem>
               <MenuItem value="DRAFT">Draft</MenuItem>
               <MenuItem value="CLOSED">Closed</MenuItem>
               <MenuItem value="EXPIRED">Expired</MenuItem>
            </Select>
         </FormControl>

         {/* Employment Type */}
         <FormControl
            size="small"
            sx={{
               minWidth: 185,
               "& .MuiOutlinedInput-root": {
                  height: 44,
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  fontSize: "14px",
                  fontWeight: 500
               }
            }}>
            <Select
               value={employmentType}
               onChange={handleEmploymentType}
               displayEmpty>
               <MenuItem value="ALL">All Employment Types</MenuItem>

               <MenuItem value="FULL_TIME">Full Time</MenuItem>

               <MenuItem value="PART_TIME">Part Time</MenuItem>

               <MenuItem value="CONTRACT">Contract</MenuItem>

               <MenuItem value="INTERNSHIP">Internship</MenuItem>

               <MenuItem value="FREELANCE">Freelance</MenuItem>

               <MenuItem value="REMOTE">Remote</MenuItem>
            </Select>
         </FormControl>

         {/* Sort */}
         <FormControl
            size="small"
            sx={{
               minWidth: 185,
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

export default JobFilters
