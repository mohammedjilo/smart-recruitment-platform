import { Chip } from "@mui/material"
import type { CompanyApprovalStatus } from "@/types/common/enums"
import { COMPANY_APPROVAL_STATUS_CONFIG } from "@/types/common/status"

type CompanyApprovalStatusChipProps = {
   status: CompanyApprovalStatus
}

const CompanyApprovalStatusChip = ({ status }: CompanyApprovalStatusChipProps) => {
   const config = COMPANY_APPROVAL_STATUS_CONFIG[status]

   return (
      <Chip
         label={config.label}
         size="small"
         className={`rounded-md! text-xs! font-semibold! ${config.className}`}
      />
   )
}

export default CompanyApprovalStatusChip
