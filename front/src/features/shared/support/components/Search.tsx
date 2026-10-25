import { TextField } from "@mui/material"
import FiltersBar from "@/components/common/FiltersBar"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"

type Props = {
   value: string
   onChange: (value: string) => void
}

export default function Search({ value, onChange }: Props) {
   const searchInput = useSubmittedSearch(value, onChange)
   return (
      <FiltersBar className="mt-6">
         <TextField
            className="[&_.MuiOutlinedInput-notchedOutline]:border-border! [&_.MuiOutlinedInput-root]:bg-surface! [&_.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-blue-600! [&_.MuiInputBase-input]:text-[13px]! [&_.MuiOutlinedInput-root]:h-10! [&_.MuiOutlinedInput-root]:rounded-lg! [&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-blue-200!"
            placeholder="Search for help articles..."
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
            variant="outlined"
            onChange={searchInput.onChange}
            onKeyDown={searchInput.onKeyDown}
         />
      </FiltersBar>
   )
}
