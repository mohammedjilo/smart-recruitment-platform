import { Chip } from "@mui/material"
import type { UserRole } from "@/types/admin"

type UserRoleChipProps = {
   role: UserRole
}

const UserRoleChip = ({ role }: UserRoleChipProps) => {
   return (
      <Chip
         size="small"
         label={role}
         className={`h-6! rounded-md! text-xs! font-semibold! ${
            role === "ADMIN"
               ? "bg-violet-50! text-violet-700!"
               : "bg-blue-50! text-blue-700!"
         } `}
      />
   )
}

export default UserRoleChip
