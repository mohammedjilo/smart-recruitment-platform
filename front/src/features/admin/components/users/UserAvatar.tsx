import { Avatar } from "@mui/material"
import { getInitials } from "@/utils/string/getInitials"

type UserAvatarProps = {
   firstName: string
   lastName: string
   profilePicUrl: string | null
}

const UserAvatar = ({ firstName, lastName, profilePicUrl }: UserAvatarProps) => {
   const initials = getInitials(`${firstName} ${lastName}`)

   return (
      <Avatar
         src={profilePicUrl || undefined}
         alt={`${firstName} ${lastName}`}
         className="h-10! w-10! bg-violet-100! text-xs! font-semibold! text-violet-700!">
         {initials}
      </Avatar>
   )
}

export default UserAvatar
