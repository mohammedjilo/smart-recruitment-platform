import React from "react"

import {
   EmailOutlined,
   LanguageOutlined,
   LocationOnOutlined,
   PhoneOutlined
} from "@mui/icons-material"

import { Box, Paper, Typography } from "@mui/material"
import type { CompanyProfileFormValues } from "./types"

interface CompanyPreviewProps {
   form: CompanyProfileFormValues
   logoPreview: string | null
}

const CompanyPreview: React.FC<CompanyPreviewProps> = ({ form, logoPreview }) => {
   return (
      <Paper
         className="rounded-[10px]! border! p-5"
         elevation={0}>
         <Typography
            className="text-[15px]! font-semibold!"
            variant="h2">
            Preview
         </Typography>

         {/* Logo */}
         <Box className="mt-5">
            {logoPreview ? (
               <img
                  className="h-20.5 w-20.5 rounded-xl border border-border object-contain p-2"
                  alt={form.companyName}
                  src={logoPreview}
               />
            ) : (
               <Box className="flex h-20.5 w-20.5 items-center justify-center rounded-xl border border-border bg-bg text-[22px] font-semibold text-violet-600">
                  {form.companyName.charAt(0) || "C"}
               </Box>
            )}
         </Box>

         {/* Name */}
         <Box className="mt-4 flex items-center gap-2">
            <Typography
               className="text-[14px]! font-semibold!"
               variant="h3">
               {form.companyName || "Company Name"}
            </Typography>
         </Box>

         {/* Description */}
         <Typography className="mt-4! text-[11px]! leading-5!" color="textSecondary">
            {form.description || "Your company description will appear here."}
         </Typography>

         {/* Contact */}
         <Box className="mt-5 space-y-4 border-t border-border pt-5">
            <PreviewItem
               value={form.email}
               icon={<EmailOutlined />}
            />

            <PreviewItem
               value={form.phone}
               icon={<PhoneOutlined />}
            />

            <PreviewItem
               value={form.website}
               icon={<LanguageOutlined />}
            />

            <PreviewItem
               value={form.location}
               icon={<LocationOnOutlined />}
            />
         </Box>
      </Paper>
   )
}

interface PreviewItemProps {
   icon: React.ReactNode
   value: string
}

const PreviewItem: React.FC<PreviewItemProps> = ({ icon, value }) => {
   if (!value) return null

   return (
      <Box className="flex items-center gap-3">
         <Box className="text-violet-600 [&>svg]:text-[17px]">{icon}</Box>

         <span className="text-[10px] break-all text-muted">{value}</span>
      </Box>
   )
}

export default CompanyPreview
