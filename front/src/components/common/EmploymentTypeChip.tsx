import { Chip } from "@mui/material"
import type { EmploymentType } from "@/types/common/enums"
import { EMPLOYMENT_TYPE_CONFIG } from "@/types/common/status"

type EmploymentTypeChipProps = {
   employmentType: EmploymentType | string
}

export const employmentStyles = EMPLOYMENT_TYPE_CONFIG

const EmploymentTypeChip = ({ employmentType }: EmploymentTypeChipProps) => {
   const config = EMPLOYMENT_TYPE_CONFIG[employmentType as EmploymentType]

   return (
      <Chip
         label={config?.label ?? employmentType}
         size="small"
         className={`w-22! rounded-md! text-xs! ${config?.className ?? "bg-slate-100 text-slate-600"}`}
      />
   )
}

export default EmploymentTypeChip
