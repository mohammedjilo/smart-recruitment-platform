import { Chip } from "@mui/material"
import type { UserRole, UserStatus } from "@/types/admin"
import { USER_STATUS_TONE_MAP, getStatusClassName } from "@/utils/statusStyles"

type StatusChipProps = {
   status: UserStatus
}

export const StatusChip = ({ status }: StatusChipProps) => {
   return (
      <Chip
         label={status}
         size="small"
         className={`h-6! rounded-md! text-[10px]! font-semibold! ${getStatusClassName(status, USER_STATUS_TONE_MAP)}!`}
      />
   )
}

type RoleChipProps = {
   role: UserRole
}

export const RoleChip = ({ role }: RoleChipProps) => {
   return (
      <Chip
         label={role}
         size="small"
         className={`h-6! rounded-md! text-[10px]! font-semibold! ${
            role === "ADMIN"
               ? "bg-violet-50! text-violet-700!"
               : "bg-blue-50! text-blue-700!"
         } `}
      />
   )
}
