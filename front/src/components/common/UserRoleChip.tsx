import { Chip } from "@mui/material"
import type { UserRole } from "@/types/common/enums"
import { USER_ROLE_CONFIG } from "@/types/common/status"

type UserRoleChipProps = {
   role: UserRole
}

const UserRoleChip = ({ role }: UserRoleChipProps) => {
   const config = USER_ROLE_CONFIG[role]

   return (
      <Chip
         className={`rounded-md! text-xs! font-semibold! ${config.className}`}
         label={config.label}
         size="small"
      />
   )
}

export default UserRoleChip
