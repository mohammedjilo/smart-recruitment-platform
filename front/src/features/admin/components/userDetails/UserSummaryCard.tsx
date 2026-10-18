import { Box, Divider, Typography } from "@mui/material"

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined"
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined"

import UserAvatar from "./UserAvatar"
import { RoleChip, StatusChip } from "./StatusChip"
import type { AdminUserDetails } from "@/types/admin"

type UserSummaryCardProps = {
   user: AdminUserDetails
}

const UserSummaryCard = ({ user }: UserSummaryCardProps) => {
   const formatDate = (date: string) => {
      return new Intl.DateTimeFormat("en-US", {
         month: "short",
         day: "numeric",
         year: "numeric"
      }).format(new Date(date))
   }

   const formatDateTime = (date: string) => {
      return new Intl.DateTimeFormat("en-US", {
         month: "short",
         day: "numeric",
         year: "numeric",
         hour: "2-digit",
         minute: "2-digit"
      }).format(new Date(date))
   }

   const calculateAge = (birthdate: string) => {
      const birth = new Date(birthdate)
      const today = new Date()

      let age = today.getFullYear() - birth.getFullYear()

      const monthDifference = today.getMonth() - birth.getMonth()

      if (
         monthDifference < 0 ||
         (monthDifference === 0 && today.getDate() < birth.getDate())
      ) {
         age--
      }

      return age
   }

   const copyUserId = async () => {
      await navigator.clipboard.writeText(user.id)
   }

   const age = calculateAge(user.birthdate)

   return (
      <Box className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
         <Box className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr]">
            {/* Left Section */}
            <Box className="p-6 lg:p-7">
               <Box className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <UserAvatar
                     firstName={user.firstName}
                     lastName={user.lastName}
                     profilePicUrl={user.profilePicUrl}
                     size={100}
                  />

                  <Box className="min-w-0">
                     <Box className="flex flex-wrap items-center gap-3">
                        <Typography className="text-2xl font-bold text-content">
                           {user.firstName} {user.lastName}
                        </Typography>

                        <StatusChip status={user.accountStatus} />
                     </Box>

                     <Box className="mt-3 flex flex-wrap items-center gap-3">
                        <RoleChip role={user.role} />

                        <Typography className="text-xs text-muted">
                           ID: {user.id}
                        </Typography>

                        <ContentCopyOutlinedIcon
                           onClick={copyUserId}
                           className="cursor-pointer! text-[18px]! text-muted! hover:text-primary!"
                        />
                     </Box>
                  </Box>
               </Box>

               <Box className="mt-7 flex flex-wrap gap-x-8 gap-y-5">
                  <Box className="flex items-center gap-2">
                     <EmailOutlinedIcon className="text-[19px]! text-violet-600!" />

                     <Typography className="text-sm text-muted">
                        {user.email}
                     </Typography>
                  </Box>

                  <Box className="flex items-center gap-2">
                     <PhoneOutlinedIcon className="text-[19px]! text-violet-600!" />

                     <Typography className="text-sm text-muted">
                        {user.phone}
                     </Typography>
                  </Box>

                  <Box className="flex items-center gap-2">
                     <LocationOnOutlinedIcon className="text-[19px]! text-violet-600!" />

                     <Typography className="text-sm text-muted">
                        {user.country}
                     </Typography>
                  </Box>
               </Box>

               <Box className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <Box className="flex items-center gap-2">
                     <CalendarMonthOutlinedIcon className="text-[18px]! text-violet-600!" />

                     <Typography className="text-sm text-muted">
                        Born on {formatDate(user.birthdate)} ({age} years old)
                     </Typography>
                  </Box>

                  <Divider
                     orientation="vertical"
                     flexItem
                     className="hidden sm:block"
                  />

                  <Box className="flex items-center gap-2">
                     <CalendarMonthOutlinedIcon className="text-[18px]! text-violet-600!" />

                     <Typography className="text-sm text-muted">
                        Joined on {formatDateTime(user.createdAt)}
                     </Typography>
                  </Box>
               </Box>
            </Box>

            {/* Right Section */}
            <Box className="border-t border-border p-6 lg:border-t-0 lg:border-l lg:p-7">
               <Box className="space-y-5">
                  {/* Role */}
                  <Box className="grid grid-cols-[150px_1fr] items-center gap-4">
                     <Box className="flex items-center gap-2">
                        <PersonOutlineOutlinedIcon className="text-[18px]! text-muted!" />

                        <Typography className="text-sm text-muted">Role</Typography>
                     </Box>

                     <RoleChip role={user.role} />
                  </Box>

                  {/* Account Status */}
                  <Box className="grid grid-cols-[150px_1fr] items-center gap-4">
                     <Typography className="text-sm text-muted">
                        Account Status
                     </Typography>

                     <StatusChip status={user.accountStatus} />
                  </Box>

                  {/* Profile Picture */}
                  <Box className="grid grid-cols-[150px_1fr] items-center gap-4">
                     <Box className="flex items-center gap-2">
                        <ImageOutlinedIcon className="text-[18px]! text-muted!" />

                        <Typography className="text-sm text-muted">
                           Profile Picture
                        </Typography>
                     </Box>

                     <Box className="flex items-center gap-2">
                        <UserAvatar
                           firstName={user.firstName}
                           lastName={user.lastName}
                           profilePicUrl={user.profilePicUrl}
                           size={30}
                        />

                        <Typography className="text-sm text-muted">
                           {user.profilePicUrl ? "Profile image" : "No profile image"}
                        </Typography>
                     </Box>
                  </Box>

                  {/* Last Updated */}
                  <Box className="grid grid-cols-[150px_1fr] items-center gap-4">
                     <Box className="flex items-center gap-2">
                        <UpdateOutlinedIcon className="text-[18px]! text-muted!" />

                        <Typography className="text-sm text-muted">
                           Last Updated
                        </Typography>
                     </Box>

                     <Typography className="text-sm font-medium text-content">
                        {formatDateTime(user.updatedAt)}
                     </Typography>
                  </Box>
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default UserSummaryCard
