import React, { useRef } from "react"

import { CloudUploadOutlined, ImageOutlined } from "@mui/icons-material"

import { Paper } from "@mui/material"

interface CompanyLogoUploadProps {
   logoPreview: string | null

   onLogoChange: (file: File | null) => void
}

const CompanyLogoUpload: React.FC<CompanyLogoUploadProps> = ({
   logoPreview,
   onLogoChange
}) => {
   const inputRef = useRef<HTMLInputElement | null>(null)

   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]

      if (!file) return

      const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"]

      if (!allowedTypes.includes(file.type)) {
         return
      }

      const maxSize = 2 * 1024 * 1024

      if (file.size > maxSize) {
         return
      }

      onLogoChange(file)
   }

   return (
      <Paper
         elevation={0}
         className="rounded-[10px]! border! p-5">
         <h2 className="text-[15px] font-semibold text-[#172033]">Company Logo</h2>

         <p className="mt-2 text-[11px] leading-5 text-muted">
            This logo will be displayed on your job postings and company profile.
         </p>

         <div
            onClick={() => inputRef.current?.click()}
            className="border-primary/40 bg-primary-tint/20 hover:bg-primary-tint/40 mt-4 flex min-h-47.5 cursor-pointer flex-col items-center justify-center rounded-2 border border-dashed p-5 transition">
            {logoPreview ? (
               <img
                  src={logoPreview}
                  alt="Company logo preview"
                  className="h-24 w-24 rounded-xl object-contain"
               />
            ) : (
               <div className="bg-primary-tint flex h-20 w-20 items-center justify-center rounded-xl">
                  <ImageOutlined
                     sx={{
                        fontSize: 40,
                        color: "var(--primary)"
                     }}
                  />
               </div>
            )}

            <button
               type="button"
               className="border-primary text-primary hover:bg-primary-tint mt-4 flex cursor-pointer items-center gap-2 rounded-md border bg-surface px-4 py-2 text-[11px] font-medium">
               <CloudUploadOutlined sx={{ fontSize: 16 }} />
               Change Logo
            </button>

            <p className="mt-3 text-center text-[9px] text-muted">
               JPG, PNG or SVG. Max size of 2MB.
            </p>

            <input
               ref={inputRef}
               type="file"
               accept=".jpg,.jpeg,.png,.svg"
               className="hidden"
               onChange={handleFileChange}
            />
         </div>
      </Paper>
   )
}

export default CompanyLogoUpload
