import { Chip } from "@mui/material"
import type { UserStatus } from "@/types/common/enums"
import { USER_STATUS_CONFIG } from "@/types/common/status"

type UserStatusChipProps = {
   status: UserStatus
}

const UserStatusChip = ({ status }: UserStatusChipProps) => {
   const config = USER_STATUS_CONFIG[status]

   return (
      <Chip
         label={config.label}
         size="small"
         className={`rounded-md! text-xs! font-semibold! ${config.className}`}
      />
   )
}

export default UserStatusChip
