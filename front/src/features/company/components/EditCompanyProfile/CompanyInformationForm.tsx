import React from "react"

import {
   LanguageOutlined,
   PhoneOutlined
} from "@mui/icons-material"

import { Box, InputAdornment, Paper, TextField, Typography } from "@mui/material"
import CountryCitySelector from "@/components/common/CountryCitySelector"
import type { CompanyProfileFormValues } from "./types"

interface CompanyInformationFormProps {
   form: CompanyProfileFormValues

   onChange: <K extends keyof CompanyProfileFormValues>(
      field: K,
      value: CompanyProfileFormValues[K]
   ) => void
   onLocationChange: (location: CompanyProfileFormValues["locationSelection"]) => void
}

const CompanyInformationForm: React.FC<CompanyInformationFormProps> = ({
   form,
   onChange,
   onLocationChange
}) => {
   return (
      <Paper
         className="rounded-[10px]! border! p-5"
         elevation={0}>
         <Typography
            className="text-[15px]! font-semibold!"
            variant="h2">
            Company Information
         </Typography>

         <Box className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
            {/* Company Name */}
            <ProfileField
               required
               label="Company Name">
               <TextField
                  value={form.companyName}
                  fullWidth
                  size="small"
                  onChange={event => onChange("companyName", event.target.value)}
               />
            </ProfileField>

            {/* Email */}
            <ProfileField
               required
               label="Email Address">
               <TextField
                  type="email"
                  value={form.email}
                  fullWidth
                  size="small"
                  onChange={event => onChange("email", event.target.value)}
               />
            </ProfileField>

            {/* Phone */}
            <ProfileField
               required
               label="Phone Number">
               <TextField
                  value={form.phone}
                  fullWidth
                  size="small"
                  slotProps={{
                     input: {
                        startAdornment: (
                           <InputAdornment position="start">
                              <PhoneOutlined className="text-lg! text-[#64748b]!" />
                           </InputAdornment>
                        )
                     }
                  }}
                  onChange={event => onChange("phone", event.target.value)}
               />
            </ProfileField>

            {/* Website */}
            <ProfileField label="Website">
               <TextField
                  placeholder="https://example.com"
                  value={form.website}
                  fullWidth
                  size="small"
                  slotProps={{
                     input: {
                        startAdornment: (
                           <InputAdornment position="start">
                              <LanguageOutlined className="text-lg! text-[#64748b]!" />
                           </InputAdornment>
                        )
                     }
                  }}
                  onChange={event => onChange("website", event.target.value)}
               />
            </ProfileField>

            {/* Location */}
            <Box className="md:col-span-2">
               <ProfileField label="Location">
                  <CountryCitySelector
                     value={form.locationSelection}
                     errors={
                        form.locationSelection.countryCode &&
                        !form.locationSelection.cityGeonameId
                           ? { cityGeonameId: "Select a city from the suggestions." }
                           : undefined
                     }
                     onChange={onLocationChange}
                  />
                  {form.location && !form.locationSelection.countryCode && (
                     <Typography className="mt-1! text-[11px]!" color="textSecondary">
                        Current saved location: {form.location}
                     </Typography>
                  )}
               </ProfileField>
            </Box>
         </Box>

         {/* Description */}
         <Box className="mt-5">
            <ProfileField label="Company Description">
               <TextField
                  placeholder="Tell candidates about your company..."
                  value={form.description}
                  fullWidth
                  helperText={`${form.description.length}/1000`}
                  minRows={5}
                  multiline
                  slotProps={{
                     htmlInput: {
                        maxLength: 1000
                     },
                     formHelperText: {
                        sx: {
                           textAlign: "right",
                           marginRight: 0
                        }
                     }
                  }}
                  onChange={event => onChange("description", event.target.value)}
               />
            </ProfileField>
         </Box>
      </Paper>
   )
}

interface ProfileFieldProps {
   label: string
   required?: boolean
   children: React.ReactNode
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, required, children }) => {
   return (
      <Box>
         <Typography className="text-content! mb-2! text-[11px]! font-semibold!">
            {label}

            {required && <span className="ml-1 text-red-500">*</span>}
         </Typography>

         {children}
      </Box>
   )
}

export default CompanyInformationForm
