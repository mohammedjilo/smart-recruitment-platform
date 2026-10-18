import { Chip } from "@mui/material"
import type { UserStatus } from "@/types/admin"

type UserStatusChipProps = {
   status: UserStatus
}

const UserStatusChip = ({ status }: UserStatusChipProps) => {
   const isActive = status === "ACTIVE"

   return (
      <Chip
         size="small"
         label={isActive ? "ACTIVE" : "DEACTIVATED"}
         className={`h-6! rounded-md! text-xs! font-semibold! ${
            isActive
               ? "bg-emerald-50! text-emerald-700!"
               : "bg-orange-50! text-orange-600!"
         } `}
      />
   )
}

export default UserStatusChip
