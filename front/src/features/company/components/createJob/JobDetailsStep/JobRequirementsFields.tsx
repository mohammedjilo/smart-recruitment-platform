import { CalendarToday } from "@mui/icons-material"
import {
   Box,
   InputAdornment,
   MenuItem,
   Select,
   TextField,
   Typography
} from "@mui/material"
import { experienceOptions } from "@/constants/createJob.constants"
import { currentDateOnlyKey } from "@smart-recruitment/validation"
import type { JobDetailsFieldsProps } from "./types"

const JobRequirementsFields = ({ form, onChange }: JobDetailsFieldsProps) => (
   <Box className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
      <Box>
         <Typography className="mb-2! block! text-[11px]! font-semibold!">
            Experience Required (Years)
            <span className="ml-1 text-red-500">*</span>
         </Typography>
         <Select
            fullWidth
            size="small"
            displayEmpty
            value={form.experience}
            onChange={event => onChange("experience", event.target.value)}>
            <MenuItem value="">
               <Typography color="textSecondary">Select years</Typography>
            </MenuItem>
            {experienceOptions.map(year => (
               <MenuItem key={year} value={year}>
                  {year}
               </MenuItem>
            ))}
         </Select>
      </Box>

      <Box>
         <Typography className="mb-2! block! text-[11px]! font-semibold!">
            Salary (Optional)
         </Typography>
         <TextField
            fullWidth
            size="small"
            type="number"
            placeholder="e.g. 80000"
            value={form.salary}
            onChange={event => onChange("salary", Number(event.target.value))}
            slotProps={{
               input: {
                  endAdornment: (
                     <InputAdornment position="end">
                        <span className="text-muted text-xs font-medium">USD</span>
                     </InputAdornment>
                  )
               }
            }}
         />
      </Box>

      <Box>
         <Typography className="mb-2! block! text-[11px]! font-semibold!">
            Application Deadline
            <span className="ml-1 text-red-500">*</span>
         </Typography>
         <TextField
            fullWidth
            size="small"
            type="date"
            value={form.deadline}
            slotProps={{
               htmlInput: { min: currentDateOnlyKey() },
               input: {
                  endAdornment: (
                     <InputAdornment position="end">
                        <CalendarToday sx={{ fontSize: 17, color: "#64748b" }} />
                     </InputAdornment>
                  )
               }
            }}
            onChange={event => onChange("deadline", event.target.value)}
         />
      </Box>
   </Box>
)

export default JobRequirementsFields