import { Avatar } from "@mui/material"
import { getInitials } from "@/utils/string/getInitials"

type CompanyRequestAvatarProps = {
   companyName: string
   logoUrl: string | null
}

const CompanyRequestAvatar = ({ companyName, logoUrl }: CompanyRequestAvatarProps) => {
   return (
      <Avatar
         className="h-10.5! w-10.5! rounded-[10px]! bg-[#F5F3FF]! text-sm! font-bold! text-[#5425D4]!"
         alt={companyName}
         src={logoUrl || undefined}
         variant="rounded">
         {getInitials(companyName)}
      </Avatar>
   )
}

export default CompanyRequestAvatar
