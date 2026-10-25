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
         className="h-10! w-10! text-xs! font-semibold!"
         src={profilePicUrl || undefined}>
         {!profilePicUrl && initials}
      </Avatar>
   )
}

export default ApplicationAvatar
