import { Box, MenuItem, Select, Typography } from "@mui/material"
import type { SelectChangeEvent } from "@mui/material/Select"
import type { DataTableColumn } from "@/components/common/DataTable"
import type {
   AdminRoleSummary,
   AdminSummary
} from "@/types/api/adminAuthorization"
import type { AssignAdminRoleArgs } from "@/types/api/adminAuthorization"

const adminRoleNames = [
   "SUPER_ADMIN",
   "SUPPORT_ADMIN",
   "OPERATIONS_ADMIN",
   "DEMO_ADMIN"
] as const

const isAdminRoleName = (
   roleName: string
): roleName is (typeof adminRoleNames)[number] =>
   adminRoleNames.some(allowedRoleName => allowedRoleName === roleName)

export type AdminManagementTableAdmin = AdminSummary & Record<string, unknown>

type AdminManagementColumnsArgs = {
   currentUserId?: string
   roles: AdminRoleSummary[]
   rolesUnavailable: boolean
   isLoadingRoles: boolean
   isAssigningRole: boolean
   isUpdatingStatus: boolean
   canAssignRole: boolean
   canDisableAdmin: boolean
   onView: (adminId: string) => void
   onAssignRole: (adminId: string, roleName: AssignAdminRoleArgs["roleName"]) => void
   onUpdateStatus: (adminId: string, status: "ACTIVE" | "DEACTIVATED") => void
}

export const getAdminManagementColumns = ({
   currentUserId,
   roles,
   rolesUnavailable,
   isLoadingRoles,
   isAssigningRole,
   isUpdatingStatus,
   canAssignRole,
   canDisableAdmin,
   onView,
   onAssignRole,
   onUpdateStatus
}: AdminManagementColumnsArgs): DataTableColumn<AdminManagementTableAdmin>[] => [
   {
      id: "name",
      header: "Admin",
      render: admin => (
         <Box>
            <button
               className="text-left font-semibold! text-content! hover:text-blue-600"
               type="button"
               onClick={() => onView(admin.id)}>
               {admin.firstName} {admin.lastName}
            </button>
            <Typography className="text-sm!" color="textSecondary">{admin.email}</Typography>
         </Box>
      )
   },
   {
      id: "role",
      header: "Admin Role",
      render: admin => (
         <Select
            disabled={
               admin.id === currentUserId ||
               !canAssignRole ||
               isLoadingRoles ||
               rolesUnavailable ||
               isAssigningRole
            }
            value={admin.adminRoleAssignments[0]?.adminRole.name ?? ""}
            size="small"
            onChange={event => {
               if (isAdminRoleName(event.target.value)) {
                  onAssignRole(admin.id, event.target.value)
               }
            }}>
            {roles.map(role => (
               <MenuItem
                  key={role.id}
                  value={role.name}>
                  {role.name}
               </MenuItem>
            ))}
         </Select>
      )
   },
   {
      id: "permissions",
      header: "Permissions",
      render: admin => (
         <Typography className="text-sm!" color="textSecondary">
            {admin.adminRoleAssignments[0]?.adminRole.name === "SUPER_ADMIN"
               ? "All permissions"
               : "Role managed"}
         </Typography>
      )
   },
   {
      id: "status",
      header: "Status",
      render: admin => (
         <Select
            disabled={
               admin.id === currentUserId || !canDisableAdmin || isUpdatingStatus
            }
            value={admin.accountStatus}
            size="small"
            onChange={(event: SelectChangeEvent) => {
               const status = event.target.value
               if (status === "ACTIVE" || status === "DEACTIVATED") {
                  onUpdateStatus(admin.id, status)
               }
            }}>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="DEACTIVATED">Deactivated</MenuItem>
         </Select>
      )
   }
]
