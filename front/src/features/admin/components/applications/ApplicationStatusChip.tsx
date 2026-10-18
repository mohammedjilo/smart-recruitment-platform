import { Chip } from "@mui/material"
import { getStatusConfig, type ApplicationStatus } from "@/utils/applicationStatus"

type ApplicationStatusChipProps = {
   status: ApplicationStatus
}

const ApplicationStatusChip = ({ status }: ApplicationStatusChipProps) => {
   const config = getStatusConfig(status)

   return (
      <Chip
         label={config.label}
         icon={config.icon}
         size="small"
         className={`h-6! rounded-md! text-[10px]! font-semibold! ${config.className}`}
      />
   )
}

export default ApplicationStatusChip
