import { Box, Menu, MenuItem, Typography } from "@mui/material"

import { useState } from "react"
import type { AdminUser, UserStatus } from "@/types/admin"
import { useUpdateUserStatusByAdminMutation } from "@/features/admin/services/adminApiCalls"
import { showAlert } from "@/utils/swal"
import DataTable from "@/components/common/DataTable"
import { getAdminUsersColumns } from "@/features/admin/columns/usersColumns"
import { formatDate as formatDateValue } from "@/utils/formatDate"
import type { SemanticQueryState } from "@/utils/queryState"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

type UsersTableProps = {
   users: AdminUser[]
   onView: (userId: string) => void
   isLoading?: boolean
   isFetching?: boolean
   pagination?: {
      totalCount: number
      page: number
      pageSize: number
   }
   onPageChange?: (page: number) => void
   queryState?: SemanticQueryState<unknown>
   onRetry?: () => void
}

const UsersTable = ({
   users,
   onView,
   isLoading = false,
   isFetching = false,
   pagination,
   onPageChange,
   queryState,
   onRetry
}: UsersTableProps) => {
   const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
   const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
   const [updateUserStatus, mutationResult] = useUpdateUserStatusByAdminMutation()
   const mutationState = getMutationState(mutationResult)
   const mutationPresentation = getMutationPresentation(mutationState, {
      surface: "action",
      importance: "important"
   })
   const isUpdatingStatus = mutationPresentation.category === "loading"

   const formatDate = (date: string) => formatDateValue(date)
   const formatTime = (date: string) => formatDateValue(date, { format: "time" })

   const openActionsMenu = (event: React.MouseEvent<HTMLElement>, user: AdminUser) => {
      setMenuAnchor(event.currentTarget)
      setSelectedUser(user)
   }

   const closeActionsMenu = () => {
      setMenuAnchor(null)
   }

   const handleStatusChange = async () => {
      if (!selectedUser) {
         return
      }

      const nextStatus: UserStatus =
         selectedUser.accountStatus === "ACTIVE" ? "DEACTIVATED" : "ACTIVE"
      const actionLabel = nextStatus === "ACTIVE" ? "reactivate" : "deactivate"

      closeActionsMenu()

      const confirmation = await showAlert({
         type: "confirm",
         title: `${nextStatus === "ACTIVE" ? "Reactivate" : "Deactivate"} user?`,
         text: `Are you sure you want to ${actionLabel} ${selectedUser.firstName} ${selectedUser.lastName}?`,
         confirmText: nextStatus === "ACTIVE" ? "Reactivate" : "Deactivate"
      })

      if (!confirmation) {
         return
      }

      if (!confirmation.isConfirmed) {
         return
      }

      try {
         await updateUserStatus({
            id: selectedUser.id,
            status: nextStatus
         }).unwrap()

         if (
            getMutationPresentation(
               { status: "success" },
               { surface: "action", importance: "important" }
            ).category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: "Status updated",
               text: `User status changed to ${nextStatus}.`
            })
         }
      } catch (error) {
         const errorPresentation = getMutationPresentation(
            getMutationErrorState(error),
            { surface: "action", importance: "important" }
         )
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Update failed",
            text: errorPresentation.message
         })
      }
   }

   const columns = getAdminUsersColumns({
      onView,
      onOpenActionsMenu: openActionsMenu,
      formatDate,
      formatTime
   })

   return (
      <Box className="contents">
         <DataTable
            columns={columns}
            emptyState={
               <Box className="flex min-h-50 items-center justify-center py-20">
                  <Typography className="text-sm! text-muted">
                     No users found.
                  </Typography>
               </Box>
            }
            getRowKey={user => user.id}
            isFetching={isFetching}
            isLoading={isLoading}
            itemLabel="users"
            pagination={pagination}
            queryState={queryState}
            rows={users}
            onPageChange={onPageChange}
            onRetry={onRetry}
         />

         <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeActionsMenu}>
            <MenuItem
               disabled={isUpdatingStatus}
               onClick={handleStatusChange}>
               {selectedUser?.accountStatus === "ACTIVE"
                  ? "Deactivate User"
                  : "Reactivate User"}
            </MenuItem>
         </Menu>
      </Box>
   )
}

export default UsersTable
