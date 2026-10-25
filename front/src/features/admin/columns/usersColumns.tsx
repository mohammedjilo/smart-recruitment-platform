import { Box, Button, IconButton, Typography } from "@mui/material"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined"

import type { DataTableColumn } from "@/components/common/DataTable"
import type { AdminUser } from "@/types/admin"

import UserAvatar from "@/features/admin/components/users/UserAvatar"
import UserRoleChip from "@/components/common/UserRoleChip"
import UserStatusChip from "@/components/common/UserStatusChip"

type GetAdminUsersColumnsArgs = {
   onView: (userId: string) => void
   onOpenActionsMenu: (event: React.MouseEvent<HTMLElement>, user: AdminUser) => void
   formatDate: (date: string) => string
   formatTime: (date: string) => string
}

export const getAdminUsersColumns = ({
   onView,
   onOpenActionsMenu,
   formatDate,
   formatTime
}: GetAdminUsersColumnsArgs): DataTableColumn<AdminUser>[] => [
   {
      id: "user",
      header: "User",
      render: user => (
         <Box className="flex min-w-45 items-center gap-3">
            <UserAvatar
               firstName={user.firstName}
               lastName={user.lastName}
               profilePicUrl={user.profilePicUrl}
            />

            <Box>
               <Typography className="text-sm! font-semibold!">
                  {user.firstName} {user.lastName}
               </Typography>

               <Typography
                  className="mt-1! max-w-32.5! truncate! text-xs!"
                  color="textSecondary">
                  ID: {user.id}
               </Typography>
            </Box>
         </Box>
      )
   },
   {
      id: "email",
      header: "Email",
      accessorKey: "email",
      render: user => (
         <Typography className="line-clamp-1! text-sm! font-medium!">
            {user.email}
         </Typography>
      )
   },
   {
      id: "phone",
      header: "Phone",
      accessorKey: "phone",
      render: user => (
         <Typography className="text-sm! font-medium! whitespace-nowrap!">
            {user.phone}
         </Typography>
      )
   },
   {
      id: "country",
      header: "Country",
      accessorKey: "country",
      render: user => (
         <Typography className="text-sm! font-medium!">{user.country}</Typography>
      )
   },
   {
      id: "role",
      header: "Role",
      accessorKey: "role",
      render: user => <UserRoleChip role={user.role} />
   },
   {
      id: "status",
      header: "Status",
      accessorKey: "accountStatus",
      render: user => <UserStatusChip status={user.accountStatus} />
   },
   {
      id: "joined-on",
      header: "Joined On",
      render: user => (
         <Box className="min-w-26.25">
            <Typography className="text-sm! font-medium!">
               {formatDate(user.createdAt)}
            </Typography>

            <Typography
               className="mt-1! text-xs!"
               color="textSecondary">
               {formatTime(user.createdAt)}
            </Typography>
         </Box>
      )
   },
   {
      id: "actions",
      header: "Actions",
      align: "center",
      render: user => (
         <Box className="flex items-center justify-center gap-2">
            <Button
               className="min-w-22! rounded-lg! text-xs! font-medium! normal-case!"
               color="primary"
               size="small"
               startIcon={<VisibilityOutlinedIcon />}
               variant="text"
               onClick={() => onView(user.id)}>
               View
            </Button>

            <IconButton
               className="rounded-lg! border!"
               size="small"
               onClick={event => onOpenActionsMenu(event, user)}>
               <MoreVertOutlinedIcon fontSize="small" />
            </IconButton>
         </Box>
      )
   }
]
