import { Controller, useFormContext } from "react-hook-form"
import { Box, FormControl, FormHelperText, MenuItem, Select, Typography } from "@mui/material"
import type { JobFormInput } from "../../types"

const JobStatusField = () => {
   const { control } = useFormContext<JobFormInput>()

   return (
      <Box className="mt-5 max-w-52.5">
         <Typography className="mb-2! block! text-[11px]! font-semibold!">
            Job Status
            <span className="ml-1 text-red-500">*</span>
         </Typography>
         <Typography className="-mt-1! mb-2! text-[10px]!" color="textSecondary">
            You can change the status later
         </Typography>
         <Controller
            name="status"
            control={control}
            render={({ field, fieldState }) => (
               <FormControl
                  error={Boolean(fieldState.error)}
                  fullWidth
                  size="small">
                  <Select {...field}>
                     <MenuItem value="OPEN">Open</MenuItem>
                     <MenuItem value="CLOSED">Closed</MenuItem>
                     <MenuItem value="DRAFT">Draft</MenuItem>
                     <MenuItem value="EXPIRED">Expired</MenuItem>
                  </Select>
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
               </FormControl>
            )}
         />
      </Box>
   )
}

export default JobStatusField