import { useSelector } from "react-redux"
import { Alert, Box, Button, MenuItem, Select, Typography } from "@mui/material"
import { useState } from "react"
import DataTable, { type DataTableColumn } from "@/components/common/DataTable"
import {
   useAssignAdminRoleMutation,
   useGetAdminRolesQuery,
   useGetAdminsQuery,
   useUpdateAdminStatusMutation
} from "@/features/admin/services/adminApiCalls"
import type { AdminSummary } from "@/types/api/adminAuthorization"
import type { RootState } from "@/redux/store"
import { useNavigate } from "react-router-dom"
import { usePermissions } from "@/features/admin/authorization/usePermissions"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

type TableAdmin = AdminSummary & Record<string, unknown>

export default function AdminManagementPage() {
   const navigate = useNavigate()
   const currentUserId = useSelector((state: RootState) => state.auth.user?.id)
   const { hasPermission } = usePermissions()
   const adminsQuery = useGetAdminsQuery()
   const adminsState = getQueryState(adminsQuery, {
      isEmpty: response => response.data.length === 0
   })
   const adminsPresentation = getQueryPresentation(adminsState, "page")
   const adminsResponse = "data" in adminsState ? adminsState.data : undefined
   const isLoadingAdmins = adminsPresentation.category === "loading"
   const rolesQuery = useGetAdminRolesQuery()
   const rolesState = getQueryState(rolesQuery, {
      isEmpty: response => response.data.length === 0
   })
   const rolesPresentation = getQueryPresentation(rolesState, "section")
   const rolesResponse = "data" in rolesState ? rolesState.data : undefined
   const isLoadingRoles = rolesPresentation.category === "loading"
   const [assignRole, roleResult] = useAssignAdminRoleMutation()
   const roleState = getMutationState(roleResult)
   const rolePresentation = getMutationPresentation(roleState, {
      surface: "action",
      importance: "important"
   })
   const [updateStatus, statusResult] = useUpdateAdminStatusMutation()
   const statusState = getMutationState(statusResult)
   const statusPresentation = getMutationPresentation(statusState, {
      surface: "action",
      importance: "important"
   })
   const [mutationError, setMutationError] = useState<string | null>(null)
   const handleMutationError = (error: unknown) => {
      const errorPresentation = getMutationPresentation(
         getMutationErrorState(error),
         { surface: "action", importance: "important" }
      )
      setMutationError(
         errorPresentation.category === "silent"
            ? null
            : errorPresentation.message ?? null
      )
   }

   const admins = (adminsResponse?.data ?? []) as TableAdmin[]
   const roles = rolesResponse?.data ?? []
   const rolesUnavailable =
      !rolesResponse ||
      roles.length === 0 ||
      rolesPresentation.category === "section_error" ||
      rolesPresentation.category === "access_denied" ||
      rolesPresentation.category === "authentication_notice" ||
      rolesPresentation.category === "resource_not_found" ||
      rolesPresentation.category === "silent" ||
      rolesPresentation.category === "none"

   const columns: DataTableColumn<TableAdmin>[] = [
      {
         id: "name",
         header: "Admin",
         render: admin => (
            <Box>
               <button
                  type="button"
                  onClick={() => navigate(`/admin/admins/${admin.id}`)}
                  className="text-left font-semibold! text-content! hover:text-blue-600">
                  {admin.firstName} {admin.lastName}
               </button>
               <Typography className="text-sm! text-muted!">{admin.email}</Typography>
            </Box>
         )
      },
      {
         id: "role",
         header: "Admin Role",
         render: admin => (
            <Select
               size="small"
               value={admin.adminRoleAssignments[0]?.adminRole.name ?? ""}
               disabled={
                  admin.id === currentUserId ||
                  !hasPermission(ADMIN_PERMISSIONS.ASSIGN_ADMIN_ROLE) ||
                  isLoadingRoles ||
                  rolesUnavailable ||
                  rolePresentation.category === "loading"
               }
               onChange={async event => {
                  setMutationError(null)
                  try {
                     await assignRole({
                        userId: admin.id,
                        roleName: event.target.value
                     }).unwrap()
                  } catch (error) {
                     handleMutationError(error)
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
            <Typography className="text-sm! text-muted!">
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
               size="small"
               value={admin.accountStatus}
               disabled={
                  admin.id === currentUserId ||
                  !hasPermission(ADMIN_PERMISSIONS.DISABLE_ADMIN) ||
                  statusPresentation.category === "loading"
               }
               onChange={async event => {
                  setMutationError(null)
                  try {
                     await updateStatus({
                        userId: admin.id,
                        status: event.target.value as "ACTIVE" | "DEACTIVATED"
                     }).unwrap()
                  } catch (error) {
                     handleMutationError(error)
                  }
               }}>
               <MenuItem value="ACTIVE">Active</MenuItem>
               <MenuItem value="DEACTIVATED">Deactivated</MenuItem>
            </Select>
         )
      }
   ]

   return (
      <Box className="space-y-5">
         <Box>
            <Typography className="text-2xl! font-bold! text-content!">
               Admin Management
            </Typography>
            <Typography className="mt-1! text-sm! text-muted!">
               Manage admin roles and account status.
            </Typography>
            {hasPermission(ADMIN_PERMISSIONS.CREATE_ADMIN) && (
               <Button
                  variant="contained"
                  onClick={() => navigate("/admin/admins/new")}
                  className="mt-4! normal-case!">
                  Create Admin
               </Button>
            )}
         </Box>
         <DataTable
            rows={admins}
            columns={columns}
            getRowKey={admin => admin.id}
            isLoading={isLoadingAdmins}
            queryState={adminsState}
            onRetry={adminsQuery.refetch}
            itemLabel="admins"
            emptyState={
               <Box className="p-10 text-center">
                  <Typography className="text-sm! text-muted!">
                     No admin accounts found.
                  </Typography>
               </Box>
            }
         />
         {mutationError && <Alert severity="error">{mutationError}</Alert>}
         {(rolesPresentation.category === "section_error" ||
            rolesPresentation.category === "access_denied" ||
            rolesPresentation.category === "authentication_notice" ||
            rolesPresentation.category === "resource_not_found" ||
            rolesPresentation.category === "stale_error") && (
            <Alert
               severity={rolesPresentation.category === "stale_error" ? "warning" : "error"}
               role={rolesPresentation.category === "stale_error" ? "status" : "alert"}
               aria-live={rolesPresentation.category === "stale_error" ? "polite" : "assertive"}
               action={
                  <Button
                     color="inherit"
                     size="small"
                     onClick={() => void rolesQuery.refetch()}>
                     Retry
                  </Button>
               }>
               {rolesPresentation.message}
            </Alert>
         )}
         {rolesPresentation.category === "empty" && (
            <Alert severity="info">
               No admin roles are available for assignment.
            </Alert>
         )}
      </Box>
   )
}
