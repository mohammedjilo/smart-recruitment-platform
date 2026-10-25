import { useSelector } from "react-redux"
import { Alert, Box, Button, Typography } from "@mui/material"
import { useState } from "react"
import DataTable from "@/components/common/DataTable"
import {
   getAdminManagementColumns,
   type AdminManagementTableAdmin
} from "@/features/admin/columns/adminManagementColumns"
import {
   useAssignAdminRoleMutation,
   useGetAdminRolesQuery,
   useGetAdminsQuery,
   useUpdateAdminStatusMutation
} from "@/features/admin/services/adminApiCalls"
import type { RootState } from "@/redux/store"
import { useNavigate } from "react-router-dom"
import { usePermissions } from "@/features/admin/authorization/usePermissions"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

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

   const admins = (adminsResponse?.data ?? []) as AdminManagementTableAdmin[]
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

   const columns = getAdminManagementColumns({
      currentUserId,
      roles,
      rolesUnavailable,
      isLoadingRoles,
      isAssigningRole: rolePresentation.category === "loading",
      isUpdatingStatus: statusPresentation.category === "loading",
      canAssignRole: hasPermission(ADMIN_PERMISSIONS.ASSIGN_ADMIN_ROLE),
      canDisableAdmin: hasPermission(ADMIN_PERMISSIONS.DISABLE_ADMIN),
      onView: adminId => navigate(`/admin/admins/${adminId}`),
      onAssignRole: async (adminId, roleName) => {
         setMutationError(null)
         try {
            await assignRole({ userId: adminId, roleName }).unwrap()
         } catch (error) {
            handleMutationError(error)
         }
      },
      onUpdateStatus: async (adminId, status) => {
         setMutationError(null)
         try {
            await updateStatus({ userId: adminId, status }).unwrap()
         } catch (error) {
            handleMutationError(error)
         }
      }
   })

   return (
      <Box className="space-y-5">
         <Box>
            <Typography className="text-2xl! font-bold! text-content!">
               Admin Management
            </Typography>
            <Typography className="mt-1! text-sm!" color="textSecondary">
               Manage admin roles and account status.
            </Typography>
            {hasPermission(ADMIN_PERMISSIONS.CREATE_ADMIN) && (
               <Button
                  className="mt-4! normal-case!"
                  variant="contained"
                  onClick={() => navigate("/admin/admins/new")}>
                  Create Admin
               </Button>
            )}
         </Box>
         <DataTable
            columns={columns}
            emptyState={
               <Box className="p-10 text-center">
                  <Typography className="text-sm!" color="textSecondary">
                     No admin accounts found.
                  </Typography>
               </Box>
            }
            getRowKey={admin => admin.id}
            isLoading={isLoadingAdmins}
            itemLabel="admins"
            queryState={adminsState}
            rows={admins}
            onRetry={adminsQuery.refetch}
         />
         {mutationError && <Alert severity="error">{mutationError}</Alert>}
         {(rolesPresentation.category === "section_error" ||
            rolesPresentation.category === "access_denied" ||
            rolesPresentation.category === "authentication_notice" ||
            rolesPresentation.category === "resource_not_found" ||
            rolesPresentation.category === "stale_error") && (
            <Alert
               aria-live={rolesPresentation.category === "stale_error" ? "polite" : "assertive"}
               action={
                  <Button
                     color="inherit"
                     size="small"
                     onClick={() => void rolesQuery.refetch()}>
                     Retry
                  </Button>
               }
               role={rolesPresentation.category === "stale_error" ? "status" : "alert"}
               severity={rolesPresentation.category === "stale_error" ? "warning" : "error"}>
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
