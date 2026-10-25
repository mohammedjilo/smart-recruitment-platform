import { Box } from "@mui/material"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"

import FiltersBar from "@/components/common/FiltersBar"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"

type Props = {
   search: string
   onSearchChange: (value: string) => void
}

const CompanyJobsFilters = ({
   search,
   onSearchChange
}: Props) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)

   return (
      <FiltersBar
         className="justify-between"
         responsiveAt="sm">
         {/* Search */}
         <Box className="relative w-full sm:max-w-105">
            <input
               className="border-border bg-surface text-content placeholder:text-muted focus:border-primary focus:ring-primary/20 h-11 w-full rounded-lg border pr-4 pl-11 text-sm transition outline-none focus:ring-2"
               placeholder="Search jobs..."
               value={searchInput.value}
               onChange={searchInput.onChange}
               onKeyDown={searchInput.onKeyDown}
            />
            <button
               className="text-muted hover:text-primary absolute top-1/2 left-3 -translate-y-1/2 rounded p-1"
               type="button"
               aria-label="Search"
               onClick={searchInput.submit}>
               <SearchOutlinedIcon className="text-xl!" />
            </button>
         </Box>

      </FiltersBar>
   )
}

export default CompanyJobsFilters
