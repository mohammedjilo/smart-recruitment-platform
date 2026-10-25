import { Chip } from "@mui/material"
import type { ApplicationStatus } from "@/types/common/enums"
import { APPLICATION_STATUS_CONFIG } from "@/types/common/status"

type ApplicationStatusChipProps = {
   status: ApplicationStatus
}

const ApplicationStatusChip = ({ status }: ApplicationStatusChipProps) => {
   const config = APPLICATION_STATUS_CONFIG[status]
   const Icon = config.icon

   return (
      <Chip
         className={`w-24! rounded-md! text-xs! font-bold! ${config.className}`}
         icon={<Icon fontSize="small" />}
         label={config.label}
         size="small"
         sx={{
            "& .MuiChip-icon": {
               color: "inherit"
            }
         }}
      />
   )
}

export default ApplicationStatusChip
