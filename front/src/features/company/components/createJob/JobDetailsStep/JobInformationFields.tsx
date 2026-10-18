import { Box, MenuItem, Select, TextField, Typography } from "@mui/material"
import { employmentTypes } from "@/constants/createJob.constants"
import type { JobDetailsFieldsProps } from "./types"

const JobInformationFields = ({ form, onChange }: JobDetailsFieldsProps) => (
   <>
      <Box className="grid grid-cols-1 gap-5 md:grid-cols-2">
         <Box>
            <Typography className="mb-2! block! text-[11px]! font-semibold!">
               Job Title
               <span className="ml-1 text-red-500">*</span>
            </Typography>
            <TextField
               fullWidth
               size="small"
               placeholder="e.g. Frontend Developer"
               value={form.title}
               onChange={event => onChange("title", event.target.value)}
            />
         </Box>

         <Box>
            <Typography className="mb-2! block! text-[11px]! font-semibold!">
               Employment Type
               <span className="ml-1 text-red-500">*</span>
            </Typography>
            <Select
               fullWidth
               size="small"
               displayEmpty
               value={form.employmentType}
               onChange={event =>
                  onChange(
                     "employmentType",
                     event.target.value as typeof form.employmentType
                  )
               }>
               <MenuItem value="">
                  <Typography color="textSecondary">Select employment type</Typography>
               </MenuItem>
               {employmentTypes.map(type => (
                  <MenuItem
                     key={type.value}
                     value={type.value}>
                     {type.label}
                  </MenuItem>
               ))}
            </Select>
         </Box>
      </Box>

      <Box className="mt-5">
         <Typography className="mb-2! block! text-[11px]! font-semibold!">
            Job Description
            <span className="ml-1 text-red-500">*</span>
         </Typography>
         <Box className="overflow-hidden rounded-[7px] border">
            <textarea
               className="h-36.25 w-full resize-none border-0 p-3 text-[13px] outline-none"
               placeholder="Describe the role, responsibilities, and what you're looking for..."
               value={form.description}
               maxLength={5000}
               onChange={event => onChange("description", event.target.value)}
            />
            <Box className="text-muted px-3 pb-2 text-right text-[11px]">
               {form.description.length}/5000
            </Box>
         </Box>
      </Box>
   </>
)

export default JobInformationFields
