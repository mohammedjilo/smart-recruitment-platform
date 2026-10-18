import { Box, Typography } from "@mui/material"
import React from "react"

interface FormFieldProps {
   label: string
   required?: boolean
   children: React.ReactNode
}

const FormField: React.FC<FormFieldProps> = ({ label, required = false, children }) => {
   return (
      <Box>
         <Typography className="mb-2! block! text-[11px]! font-semibold!">
            {label}

            {required && <span className="ml-1 text-red-500">*</span>}
         </Typography>

         {children}
      </Box>
   )
}

export default FormField
