import { TextField } from "@mui/material"

import CountryCitySelector, {
   type LocationSelection
} from "@/components/common/CountryCitySelector"
import FiltersBar from "@/components/common/FiltersBar"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"

type Props = {
   search: string
   location: LocationSelection
   onSearchChange: (value: string) => void
   onLocationChange: (value: LocationSelection) => void
}

const CompanySearch = ({ search, location, onSearchChange, onLocationChange }: Props) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   return (
      <FiltersBar className="items-center">
         <TextField
            className="max-w-105"
            placeholder="Search company name or keyword..."
            value={searchInput.value}
            fullWidth
            slotProps={{
               input: {
                  startAdornment: (
                     <SearchSubmitAdornment onSearch={searchInput.submit} />
                  )
               }
            }}
            sx={{
               "& .MuiOutlinedInput-root": {
                  height: 48,
                  borderRadius: "8px"
               },

               "& .MuiInputBase-input": {
                  fontSize: "14px"
               }
            }}
            onChange={searchInput.onChange}
            onKeyDown={searchInput.onKeyDown}
         />
         <CountryCitySelector value={location} onChange={onLocationChange} />
      </FiltersBar>
   )
}

export default CompanySearch
