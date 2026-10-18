import { Avatar } from "@mui/material"
import { getInitials } from "@/utils/string/getInitials"

type UserAvatarProps = {
   firstName: string
   lastName: string
   profilePicUrl: string | null
   size?: number
}

const UserAvatar = ({
   firstName,
   lastName,
   profilePicUrl,
   size = 96
}: UserAvatarProps) => {
   const initials = getInitials(`${firstName} ${lastName}`)

   return (
      <Avatar
         src={profilePicUrl || undefined}
         alt={`${firstName} ${lastName}`}
         sx={{
            width: size,
            height: size
         }}
         className="bg-violet-100! text-xl! font-bold! text-violet-700">
         {initials}
      </Avatar>
   )
}

export default UserAvatar
