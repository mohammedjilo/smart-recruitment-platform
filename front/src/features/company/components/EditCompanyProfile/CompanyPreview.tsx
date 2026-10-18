import React from "react"

import {
   EmailOutlined,
   LanguageOutlined,
   LocationOnOutlined,
   PhoneOutlined
} from "@mui/icons-material"

import { Paper } from "@mui/material"
import type { CompanyProfileFormValues } from "./types"

interface CompanyPreviewProps {
   form: CompanyProfileFormValues
   logoPreview: string | null
}

const CompanyPreview: React.FC<CompanyPreviewProps> = ({ form, logoPreview }) => {
   return (
      <Paper
         elevation={0}
         className="rounded-[10px]! border! p-5">
         <h2 className="text-[15px] font-semibold text-[#172033]">Preview</h2>

         {/* Logo */}
         <div className="mt-5">
            {logoPreview ? (
               <img
                  src={logoPreview}
                  alt={form.companyName}
                  className="h-20.5 w-20.5 rounded-xl border border-border object-contain p-2"
               />
            ) : (
               <div className="flex h-20.5 w-20.5 items-center justify-center rounded-xl border border-border bg-bg text-[22px] font-semibold text-violet-600">
                  {form.companyName.charAt(0) || "C"}
               </div>
            )}
         </div>

         {/* Name */}
         <div className="mt-4 flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-[#172033]">
               {form.companyName || "Company Name"}
            </h3>
         </div>

         {/* Description */}
         <p className="mt-4 text-[11px] leading-5 text-muted">
            {form.description || "Your company description will appear here."}
         </p>

         {/* Contact */}
         <div className="mt-5 space-y-4 border-t border-border pt-5">
            <PreviewItem
               icon={<EmailOutlined />}
               value={form.email}
            />

            <PreviewItem
               icon={<PhoneOutlined />}
               value={form.phone}
            />

            <PreviewItem
               icon={<LanguageOutlined />}
               value={form.website}
            />

            <PreviewItem
               icon={<LocationOnOutlined />}
               value={form.location}
            />
         </div>
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
      <div className="flex items-center gap-3">
         <div className="text-violet-600 [&>svg]:text-[17px]">{icon}</div>

         <span className="text-[10px] break-all text-muted">{value}</span>
      </div>
   )
}

export default CompanyPreview
