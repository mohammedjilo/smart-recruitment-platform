import { Avatar } from "@mui/material"
import { getInitials } from "@/utils/string/getInitials"

type ApplicationAvatarProps = {
   firstName: string
   lastName: string
   profilePicUrl: string | null
}

const ApplicationAvatar = ({
   firstName,
   lastName,
   profilePicUrl
}: ApplicationAvatarProps) => {
   const initials = getInitials([firstName, lastName].filter(Boolean).join(" "))

   return (
      <Avatar
         src={profilePicUrl || undefined}
         className="h-10! w-10! text-xs! font-semibold!">
         {!profilePicUrl && initials}
      </Avatar>
   )
}

export default ApplicationAvatar
