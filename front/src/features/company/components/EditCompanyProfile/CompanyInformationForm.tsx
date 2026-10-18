import React from "react"

import { LanguageOutlined, LocationOnOutlined, PhoneOutlined } from "@mui/icons-material"

import { InputAdornment, Paper, TextField } from "@mui/material"
import type { CompanyProfileFormValues } from "./types"

interface CompanyInformationFormProps {
   form: CompanyProfileFormValues

   onChange: <K extends keyof CompanyProfileFormValues>(
      field: K,
      value: CompanyProfileFormValues[K]
   ) => void
}

const CompanyInformationForm: React.FC<CompanyInformationFormProps> = ({
   form,
   onChange
}) => {
   return (
      <Paper
         elevation={0}
         className="rounded-[10px]! border! p-5">
         <h2 className="text-[15px] font-semibold text-[#172033]">Company Information</h2>

         <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
            {/* Company Name */}
            <ProfileField
               label="Company Name"
               required>
               <TextField
                  fullWidth
                  size="small"
                  value={form.companyName}
                  onChange={event => onChange("companyName", event.target.value)}
               />
            </ProfileField>

            {/* Email */}
            <ProfileField
               label="Email Address"
               required>
               <TextField
                  fullWidth
                  size="small"
                  type="email"
                  value={form.email}
                  onChange={event => onChange("email", event.target.value)}
               />
            </ProfileField>

            {/* Phone */}
            <ProfileField
               label="Phone Number"
               required>
               <TextField
                  fullWidth
                  size="small"
                  value={form.phone}
                  onChange={event => onChange("phone", event.target.value)}
                  slotProps={{
                     input: {
                        startAdornment: (
                           <InputAdornment position="start">
                              <PhoneOutlined
                                 sx={{
                                    fontSize: 18,
                                    color: "#64748b"
                                 }}
                              />
                           </InputAdornment>
                        )
                     }
                  }}
               />
            </ProfileField>

            {/* Website */}
            <ProfileField label="Website">
               <TextField
                  fullWidth
                  size="small"
                  value={form.website}
                  placeholder="https://example.com"
                  onChange={event => onChange("website", event.target.value)}
                  slotProps={{
                     input: {
                        startAdornment: (
                           <InputAdornment position="start">
                              <LanguageOutlined
                                 sx={{
                                    fontSize: 18,
                                    color: "#64748b"
                                 }}
                              />
                           </InputAdornment>
                        )
                     }
                  }}
               />
            </ProfileField>

            {/* Location */}
            <ProfileField label="Location">
               <TextField
                  fullWidth
                  size="small"
                  value={form.location}
                  onChange={event => onChange("location", event.target.value)}
                  slotProps={{
                     input: {
                        startAdornment: (
                           <InputAdornment position="start">
                              <LocationOnOutlined
                                 sx={{
                                    fontSize: 18,
                                    color: "#64748b"
                                 }}
                              />
                           </InputAdornment>
                        )
                     }
                  }}
               />
            </ProfileField>

         </div>

         {/* Description */}
         <div className="mt-5">
            <ProfileField label="Company Description">
               <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  value={form.description}
                  placeholder="Tell candidates about your company..."
                  onChange={event => onChange("description", event.target.value)}
                  helperText={`${form.description.length}/1000`}
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
               />
            </ProfileField>
         </div>
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
      <div>
         <p className="mb-2 text-[11px] font-semibold text-content">
            {label}

            {required && <span className="ml-1 text-red-500">*</span>}
         </p>

         {children}
      </div>
   )
}

export default CompanyInformationForm
