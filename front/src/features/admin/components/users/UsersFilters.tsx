import { MenuItem, TextField } from "@mui/material"

import type { UserStatus } from "@/types/admin"
import FiltersBar from "@/components/common/FiltersBar"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"
import CountryCitySelector, {
   type LocationSelection
} from "@/components/common/CountryCitySelector"

type UsersFiltersProps = {
   search: string
   status: UserStatus | "ALL"
   location: LocationSelection
   onSearchChange: (value: string) => void

   onStatusChange: (value: UserStatus | "ALL") => void
   onLocationChange: (value: LocationSelection) => void
}

const UsersFilters = ({
   search,
   status,
   location,
   onSearchChange,
   onStatusChange,
   onLocationChange
}: UsersFiltersProps) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   return (
      <FiltersBar>
         <TextField
            className="bg-surface md:max-w-90"
            placeholder="Search by name, email or phone..."
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

         <CountryCitySelector
            value={location}
            size="small"
            onChange={onLocationChange}
         />

         <TextField
            className="bg-surface w-full md:w-55"
            value={status}
            select
            size="small"
            onChange={event => onStatusChange(event.target.value as UserStatus | "ALL")}>
            <MenuItem value="ALL">All Status</MenuItem>

            <MenuItem value="ACTIVE">Active</MenuItem>

            <MenuItem value="DEACTIVATED">Deactivated</MenuItem>
         </TextField>
      </FiltersBar>
   )
}

export default UsersFilters
