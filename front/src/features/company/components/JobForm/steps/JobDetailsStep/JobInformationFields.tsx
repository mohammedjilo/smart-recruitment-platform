import { Controller, useFormContext } from "react-hook-form"
import {
   Box,
   FormControl,
   FormHelperText,
   MenuItem,
   Select,
   TextField,
   Typography
} from "@mui/material"
import { employmentTypes } from "@/constants/createJob.constants"
import type { JobFormInput } from "../../types"

const JobInformationFields = () => {
   const { control, watch } = useFormContext<JobFormInput>()
   const description = watch("description")

   return (
      <Box className="contents">
         <Box className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Box>
               <Typography className="mb-2! block! text-[11px]! font-semibold!">
                  Job Title
                  <span className="ml-1 text-red-500">*</span>
               </Typography>
               <Controller
                  name="title"
                  control={control}
                  render={({ field, fieldState }) => (
                     <TextField
                        {...field}
                        placeholder="e.g. Frontend Developer"
                        error={Boolean(fieldState.error)}
                        fullWidth
                        helperText={fieldState.error?.message}
                        size="small"
                     />
                  )}
               />
            </Box>

            <Box>
               <Typography className="mb-2! block! text-[11px]! font-semibold!">
                  Employment Type
                  <span className="ml-1 text-red-500">*</span>
               </Typography>
               <Controller
                  name="employmentType"
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
                              <Typography color="textSecondary">
                                 Select employment type
                              </Typography>
                           </MenuItem>
                           {employmentTypes.map(type => (
                              <MenuItem
                                 key={type.value}
                                 value={type.value}>
                                 {type.label}
                              </MenuItem>
                           ))}
                        </Select>
                        <FormHelperText>{fieldState.error?.message}</FormHelperText>
                     </FormControl>
                  )}
               />
            </Box>
         </Box>

         <Box className="mt-5">
            <Typography className="mb-2! block! text-[11px]! font-semibold!">
               Job Description
               <span className="ml-1 text-red-500">*</span>
            </Typography>
            <Box className="overflow-hidden rounded-[7px] border">
               <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                     <Box className="contents">
                        <textarea
                           {...field}
                           className="h-36.25 w-full resize-none border-0 p-3 text-[13px] outline-none"
                           placeholder="Describe the role, responsibilities, and what you're looking for..."
                           maxLength={5000}
                        />
                        {fieldState.error && (
                           <Typography
                              className="px-3 pb-1 text-xs! text-red-600!"
                              role="alert">
                              {fieldState.error.message}
                           </Typography>
                        )}
                     </Box>
                  )}
               />
               <Box className="text-muted px-3 pb-2 text-right text-[11px]">
                  {description.length}/5000
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default JobInformationFields
