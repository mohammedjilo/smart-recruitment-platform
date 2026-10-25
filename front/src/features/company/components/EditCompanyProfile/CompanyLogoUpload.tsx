import React, { useRef } from "react"

import { CloudUploadOutlined, ImageOutlined } from "@mui/icons-material"

import { Box, Paper, Typography } from "@mui/material"

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
         className="rounded-[10px]! border! p-5"
         elevation={0}>
         <Typography
            className="text-[15px]! font-semibold!"
            variant="h2">
            Company Logo
         </Typography>

         <Typography className="mt-2! text-[11px]! leading-5!" color="textSecondary">
            This logo will be displayed on your job postings and company profile.
         </Typography>

         <Box
            className="border-primary/40 bg-primary-tint/20 hover:bg-primary-tint/40 rounded-2 mt-4 flex min-h-47.5 cursor-pointer flex-col items-center justify-center border border-dashed p-5 transition"
            onClick={() => inputRef.current?.click()}>
            {logoPreview ? (
               <img
                  className="h-24 w-24 rounded-xl object-contain"
                  alt="Company logo preview"
                  src={logoPreview}
               />
            ) : (
               <Box className="bg-primary-tint flex h-20 w-20 items-center justify-center rounded-xl">
                  <ImageOutlined className="text-[40px]! text-(--primary)!" />
               </Box>
            )}

            <button
               className="border-primary text-primary hover:bg-primary-tint bg-surface mt-4 flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-[11px] font-medium"
               type="button">
               <CloudUploadOutlined className="text-base!" />
               Change Logo
            </button>

            <Typography className="mt-3! text-center! text-[9px]!" color="textSecondary">
               JPG, PNG or SVG. Max size of 2MB.
            </Typography>

            <input
               className="hidden"
               ref={inputRef}
               type="file"
               accept=".jpg,.jpeg,.png,.svg"
               onChange={handleFileChange}
            />
         </Box>
      </Paper>
   )
}

export default CompanyLogoUpload
