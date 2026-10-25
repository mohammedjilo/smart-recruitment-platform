import { CalendarToday } from "@mui/icons-material"
import { Controller, useFormContext } from "react-hook-form"
import {
   Box,
   FormControl,
   FormHelperText,
   InputAdornment,
   MenuItem,
   Select,
   TextField,
   Typography
} from "@mui/material"
import { experienceOptions } from "@/constants/createJob.constants"
import { currentDateOnlyKey } from "@smart-recruitment/validation"
import type { JobFormInput } from "../../types"

const JobRequirementsFields = () => {
   const { control } = useFormContext<JobFormInput>()

   return (
      <Box className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
         <Box>
            <Typography className="mb-2! block! text-[11px]! font-semibold!">
               Experience Required (Years)
               <span className="ml-1 text-red-500">*</span>
            </Typography>
            <Controller
               name="experience"
               control={control}
               render={({ field, fieldState }) => (
                  <FormControl
                     error={Boolean(fieldState.error)}
                     fullWidth
                     size="small">
                     <Select
                        {...field}
                        displayEmpty>
                        <MenuItem value="">
                           <Typography color="textSecondary">Select years</Typography>
                        </MenuItem>
                        {experienceOptions.map(year => (
                           <MenuItem
                              key={year}
                              value={year}>
                              {year}
                           </MenuItem>
                        ))}
                     </Select>
                     <FormHelperText>{fieldState.error?.message}</FormHelperText>
                  </FormControl>
               )}
            />
         </Box>

         <Box>
            <Typography className="mb-2! block! text-[11px]! font-semibold!">
               Salary (Optional)
            </Typography>
            <Controller
               name="salary"
               control={control}
               render={({ field, fieldState }) => (
                  <TextField
                     {...field}
                     placeholder="e.g. 80000"
                     type="number"
                     value={field.value}
                     error={Boolean(fieldState.error)}
                     fullWidth
                     helperText={fieldState.error?.message}
                     size="small"
                     slotProps={{
                        input: {
                           endAdornment: (
                              <InputAdornment position="end">
                                 <span className="text-muted text-xs font-medium">
                                    USD
                                 </span>
                              </InputAdornment>
                           )
                        }
                     }}
                     onChange={event =>
                        field.onChange(
                           event.target.value === "" ? 0 : Number(event.target.value)
                        )
                     }
                  />
               )}
            />
         </Box>

         <Box>
            <Typography className="mb-2! block! text-[11px]! font-semibold!">
               Application Deadline
               <span className="ml-1 text-red-500">*</span>
            </Typography>
            <Controller
               name="deadline"
               control={control}
               render={({ field, fieldState }) => (
                  <TextField
                     {...field}
                     type="date"
                     error={Boolean(fieldState.error)}
                     fullWidth
                     helperText={fieldState.error?.message}
                     size="small"
                     slotProps={{
                        htmlInput: { min: currentDateOnlyKey() },
                        input: {
                           endAdornment: (
                              <InputAdornment position="end">
                                 <CalendarToday className="text-[17px]! text-[#64748b]!" />
                              </InputAdornment>
                           )
                        }
                     }}
                  />
               )}
            />
         </Box>
      </Box>
   )
}

export default JobRequirementsFields
