import { Avatar } from "@mui/material"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"

import type { Company } from "@/types/user"

type Props = {
   company: Company
}

const CompanyLogo = ({ company }: Props) => {
   return (
      <Avatar
         src={company.logoUrl ?? undefined}
         alt={company.companyName}
         className="h-14 w-14 shrink-0 rounded-xl border border-border bg-bg">
         {!company.logoUrl && <BusinessOutlinedIcon className="text-violet-600" />}
      </Avatar>
   )
}

export default CompanyLogo
