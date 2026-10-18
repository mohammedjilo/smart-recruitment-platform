import { Chip } from "@mui/material"
import type { CompanyStatus } from "@/types/common/enums"
import { COMPANY_STATUS_CONFIG } from "@/types/common/status"

type CompanyStatusChipProps = {
   status: CompanyStatus
}

const CompanyStatusChip = ({ status }: CompanyStatusChipProps) => {
   const config = COMPANY_STATUS_CONFIG[status]

   return (
      <Chip
         label={config.label}
         size="small"
         className={`rounded-md! text-xs! font-semibold! ${config.className}`}
      />
   )
}

export default CompanyStatusChip
