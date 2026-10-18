import { Avatar, Box, Button, Divider, Typography } from "@mui/material"

import {
   ArrowBack,
   CalendarMonthOutlined,
   LocationOnOutlined,
   MailOutlined,
   PhoneOutlined
} from "@mui/icons-material"

import { useNavigate } from "react-router-dom"
import type { AdminUserDetails } from "@/types/admin"
import UserRoleChip from "@/components/common/UserRoleChip"
import UserStatusChip from "@/components/common/UserStatusChip"
import { formatDate } from "@/utils/formatDate"

type Props = {
   user: AdminUserDetails
}

const UserDetailsHeader = ({ user }: Props) => {
   const navigate = useNavigate()

   const fullName = `${user.firstName} ${user.lastName}`

   const formattedBirthdate = formatDate(user.birthdate)
   const formattedCreatedAt = formatDate(user.createdAt)

   return (
      <Box className="overflow-hidden rounded-xl border bg-surface shadow-sm">
         {/* Top */}
         <Box className="flex items-center justify-between border-b px-6 py-5">
            <Box>
               <Typography className="font-bold! text-content">User Details</Typography>

               <Typography className="mt-1! text-muted">
                  View user information.
               </Typography>
            </Box>

            <Button
               variant="outlined"
               color="primary"
               startIcon={<ArrowBack />}
               onClick={() => navigate(-1)}
               className="px-5! normal-case!">
               Back to Users
            </Button>
         </Box>

         {/* User Info */}
         <Box className="grid grid-cols-1 gap-8 px-6 py-7 lg:grid-cols-[1.4fr_0.9fr]">
            <Box className="flex gap-6">
               <Avatar
                  src={user.profilePicUrl || undefined}
                  alt={fullName}
                  className="h-24 w-24 text-2xl font-semibold"
                  sx={{
                     width: 96,
                     height: 96,
                     bgcolor: "#ede9fe",
                     color: "#6d28d9"
                  }}>
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
                        orientation="vertical"
                        flexItem
                        className="hidden sm:block"
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
