import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"
import { IconButton, InputAdornment } from "@mui/material"

type Props = {
   onSearch: () => void
}

export default function SearchSubmitAdornment({ onSearch }: Props) {
   return (
      <InputAdornment position="start">
         <IconButton
            type="button"
            aria-label="Search"
            edge="start"
            size="small"
            onClick={onSearch}>
            <SearchOutlinedIcon fontSize="small" />
         </IconButton>
      </InputAdornment>
   )
}
