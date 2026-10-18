import { Avatar } from "@mui/material"
import { getInitials } from "@/utils/string/getInitials"

type CompanyRequestAvatarProps = {
   companyName: string
   logoUrl: string | null
}

const CompanyRequestAvatar = ({ companyName, logoUrl }: CompanyRequestAvatarProps) => {
   return (
      <Avatar
         src={logoUrl || undefined}
         alt={companyName}
         variant="rounded"
         sx={{
            width: 42,
            height: 42,
            borderRadius: "10px",
            backgroundColor: "#F5F3FF",
            color: "#5425D4",
            fontSize: "14px",
            fontWeight: 700
         }}>
         {getInitials(companyName)}
      </Avatar>
   )
}

export default CompanyRequestAvatar
