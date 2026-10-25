import { Avatar, Box, Button, Divider, Typography } from "@mui/material"

import {
   ArrowBack,
   CalendarMonthOutlined,
   LocationOnOutlined,
   MailOutlined,
   PhoneOutlined
} from "@mui/icons-material"

import { useNavigate } from "react-router-dom"
import type { AdminUserDetails, UserStatus } from "@/types/admin"
import UserRoleChip from "@/components/common/UserRoleChip"
import UserStatusChip from "@/components/common/UserStatusChip"
import { formatDate } from "@/utils/formatDate"
import { useUpdateUserStatusByAdminMutation } from "@/features/admin/services/adminApiCalls"
import { usePermissions } from "@/features/admin/authorization/usePermissions"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"
import { showAlert } from "@/utils/swal"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

type Props = {
   user: AdminUserDetails
}

const UserDetailsHeader = ({ user }: Props) => {
   const navigate = useNavigate()
   const { hasPermission } = usePermissions()
   const canChangeStatus = hasPermission(ADMIN_PERMISSIONS.SUSPEND_USERS)
   const [updateUserStatus, statusResult] = useUpdateUserStatusByAdminMutation()
   const statusState = getMutationState(statusResult)
   const statusPresentation = getMutationPresentation(statusState, {
      surface: "action",
      importance: "important"
   })
   const isUpdatingStatus = statusPresentation.category === "loading"

   const fullName = `${user.firstName} ${user.lastName}`

   const formattedBirthdate = formatDate(user.birthdate)
   const formattedCreatedAt = formatDate(user.createdAt)

   const handleStatusChange = async () => {
      const nextStatus: UserStatus =
         user.accountStatus === "ACTIVE" ? "DEACTIVATED" : "ACTIVE"
      const actionLabel = nextStatus === "ACTIVE" ? "reactivate" : "deactivate"

      const confirmation = await showAlert({
         type: "confirm",
         title: `${nextStatus === "ACTIVE" ? "Reactivate" : "Deactivate"} user?`,
         text: `Are you sure you want to ${actionLabel} ${fullName}?`,
         confirmText: nextStatus === "ACTIVE" ? "Reactivate" : "Deactivate"
      })

      if (!confirmation || !confirmation.isConfirmed) {
         return
      }

      try {
         await updateUserStatus({
            id: user.id,
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
               text: `${fullName} is now ${nextStatus.toLowerCase()}.`
            })
         }
      } catch (error) {
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "important"
         })
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Update failed",
            text: errorPresentation.message
         })
      }
   }

   return (
      <Box className="bg-surface overflow-hidden rounded-xl border shadow-sm">
         {/* Top */}
         <Box className="flex items-center justify-between border-b px-6 py-5">
            <Box>
               <Typography className="text-content font-bold!">User Details</Typography>

               <Typography className="text-muted mt-1!">
                  View user information.
               </Typography>
            </Box>

            <Box className="flex flex-wrap items-center justify-end gap-2">
               {canChangeStatus && (
                  <Button
                     className="normal-case!"
                     disabled={isUpdatingStatus}
                     color={user.accountStatus === "ACTIVE" ? "error" : "success"}
                     variant="contained"
                     onClick={handleStatusChange}>
                     {user.accountStatus === "ACTIVE"
                        ? "Deactivate User"
                        : "Reactivate User"}
                  </Button>
               )}
               <Button
                  className="px-5! normal-case!"
                  color="primary"
                  startIcon={<ArrowBack />}
                  variant="outlined"
                  onClick={() => navigate("/admin/users")}>
                  Back to Users
               </Button>
            </Box>
         </Box>

         {/* User Info */}
         <Box className="grid grid-cols-1 gap-8 px-6 py-7 lg:grid-cols-[1.4fr_0.9fr]">
            <Box className="flex gap-6">
               <Avatar
                  className="h-24! w-24! bg-[#ede9fe]! text-2xl! font-semibold! text-[#6d28d9]!"
                  alt={fullName}
                  src={user.profilePicUrl || undefined}>
                  {!user.profilePicUrl &&
                     `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`}
               </Avatar>

               <Box className="flex min-w-0 flex-1 flex-col justify-center">
                  <Box className="flex flex-wrap items-center gap-3">
                     <Typography className="font-bold!">{fullName}</Typography>

                     <UserStatusChip status={user.accountStatus} />
                  </Box>

                  <Box className="mt-3 flex flex-wrap items-center gap-x-7 gap-y-3">
                     <Box className="flex items-center gap-2">
                        <MailOutlined
                           className="text-violet-600"
                           fontSize="small"
                        />

                        <Typography color="textSecondary">{user.email}</Typography>
                     </Box>

                     <Box className="flex items-center gap-2">
                        <PhoneOutlined
                           className="text-violet-600"
                           fontSize="small"
                        />

                        <Typography color="textSecondary">{user.phone}</Typography>
                     </Box>

                     <Box className="flex items-center gap-2">
                        <LocationOnOutlined
                           className="text-violet-600"
                           fontSize="small"
                        />

                        <Typography color="textSecondary">{user.country}</Typography>
                     </Box>
                  </Box>

                  <Box className="mt-5 flex flex-wrap items-center gap-4">
                     <Box className="flex items-center gap-2">
                        <CalendarMonthOutlined
                           className="text-violet-600"
                           fontSize="small"
                        />

                        <Typography color="textSecondary">
                           Born on {formattedBirthdate}
                        </Typography>
                     </Box>

                     <Divider
                        className="hidden sm:block"
                        flexItem
                        orientation="vertical"
                     />

                     <Typography color="textSecondary">
                        Joined on {formattedCreatedAt}
                     </Typography>
                  </Box>
               </Box>
            </Box>

            {/* Right side - no Account Status card */}
            <Box className="flex items-center border-t pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
               <Box className="grid w-full gap-5">
                  <Box className="flex justify-between">
                     <Typography
                        className="font-medium!"
                        color="textSecondary">
                        Role
                     </Typography>

                     <UserRoleChip role={user.role} />
                  </Box>

                  <Box className="flex justify-between gap-4">
                     <Typography
                        className="font-medium!"
                        color="textSecondary">
                        User ID
                     </Typography>

                     <Typography className="max-w-55! truncate! font-medium!">
                        {user.id}
                     </Typography>
                  </Box>

                  <Box className="flex justify-between">
                     <Typography
                        className="font-medium!"
                        color="textSecondary">
                        Last Updated
                     </Typography>

                     <Typography className="font-medium!">
                        {formatDate(user.updatedAt)}
                     </Typography>
                  </Box>
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default UserDetailsHeader
