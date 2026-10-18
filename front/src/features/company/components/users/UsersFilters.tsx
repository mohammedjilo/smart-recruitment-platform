import { Box, MenuItem, Select, TextField, type SelectChangeEvent } from "@mui/material"

import type { ExperienceFilter } from "@/types/company"
import FiltersBar from "@/components/common/FiltersBar"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"
import CountryCitySelector, {
   type LocationSelection
} from "@/components/common/CountryCitySelector"

type Props = {
   search: string
   experience: ExperienceFilter
   location: LocationSelection
   onSearchChange: (value: string) => void
   onExperienceChange: (value: ExperienceFilter) => void
   onLocationChange: (value: LocationSelection) => void
}

const UsersFilters = ({
   search,
   experience,
   location,
   onSearchChange,
   onExperienceChange,
   onLocationChange
}: Props) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   const handleExperienceChange = (event: SelectChangeEvent) => {
      onExperienceChange(event.target.value as ExperienceFilter)
   }

   return (
      <FiltersBar responsiveAt="lg">
         {/* Search */}
         <Box className="w-full lg:max-w-90">
            <TextField
               fullWidth
               value={searchInput.value}
               onChange={searchInput.onChange}
               onKeyDown={searchInput.onKeyDown}
               placeholder="Search by name, email"
               sx={{
                  "& .MuiOutlinedInput-root": {
                     height: 44,
                     borderRadius: "10px",
                     backgroundColor: "#ffffff",
                     fontSize: "14px"
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
         </Box>

         {/* Experience */}
         <Box className="w-full lg:max-w-90">
            <Select
               fullWidth
               value={experience}
               onChange={handleExperienceChange}
               sx={{
                  height: 44,
                  borderRadius: "10px",
                  backgroundColor: "#ffffff",
                  fontSize: "14px"
               }}>
               <MenuItem value="ALL">All Experience</MenuItem>

               <MenuItem value="0-2">0 - 2 Years</MenuItem>

               <MenuItem value="3-5">3 - 5 Years</MenuItem>

               <MenuItem value="6+">6+ Years</MenuItem>
            </Select>
         </Box>
         <Box className="w-full">
            <CountryCitySelector value={location} onChange={onLocationChange} />
         </Box>
      </FiltersBar>
   )
}

export default UsersFilters
