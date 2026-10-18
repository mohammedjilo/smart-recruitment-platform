import { Box, MenuItem, Select, Typography } from "@mui/material"
import type { JobDetailsFieldsProps } from "./types"

const JobStatusField = ({ form, onChange }: JobDetailsFieldsProps) => (
   <Box className="mt-5 max-w-52.5">
      <Typography className="mb-2! block! text-[11px]! font-semibold!">
         Job Status
         <span className="ml-1 text-red-500">*</span>
      </Typography>
      <p className="text-muted -mt-1 mb-2 text-[10px]">
         You can change the status later
      </p>
      <Select
         fullWidth
         size="small"
         value={form.status}
         onChange={event =>
            onChange("status", event.target.value as typeof form.status)
         }>
         <MenuItem value="OPEN">Open</MenuItem>
         <MenuItem value="CLOSED">Closed</MenuItem>
         <MenuItem value="DRAFT">Draft</MenuItem>
         <MenuItem value="EXPIRED">Expired</MenuItem>
      </Select>
   </Box>
)

export default JobStatusField