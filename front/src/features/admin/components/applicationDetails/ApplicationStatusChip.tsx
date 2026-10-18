import { Box, Typography } from "@mui/material"
import { getStatusConfig, type ApplicationStatus } from "@/utils/applicationStatus"

type ApplicationStatusChipProps = {
   status: ApplicationStatus
}

const ApplicationStatusChip = ({ status }: ApplicationStatusChipProps) => {
   const config = getStatusConfig(status)

   return (
      <Box
         className={`inline-flex items-center gap-1 rounded-md px-3 py-1 ${config.className}`}>
         {config.icon}
         <Typography className="text-[10px]! font-bold!">{config.label}</Typography>
      </Box>
   )
}

export default ApplicationStatusChip
