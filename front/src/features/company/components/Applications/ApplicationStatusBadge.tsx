import React from "react"
import { getStatusConfig, type ApplicationStatus } from "@/utils/applicationStatus"
import { Box, Typography } from "@mui/material"

interface ApplicationStatusBadgeProps {
   status: ApplicationStatus
}

const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({ status }) => {
   const config = getStatusConfig(status)

   return (
      // <span
      //    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-semibold ${config.className}`}>
      //    {config.icon}
      //    {config.label}
      // </span>
      <Box className="flex flex-1 justify-start">
         <Box
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 ${config.className} `}>
            {config.icon}

            <Typography className="text-[13px]! font-medium!">{config.label}</Typography>
         </Box>
      </Box>
   )
}

export default ApplicationStatusBadge
