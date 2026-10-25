import MenuRounded from "@mui/icons-material/MenuRounded"
import { AppBar, Avatar, Box, IconButton, Toolbar, Typography } from "@mui/material"
import React from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { getInitials } from "@/utils/string/getInitials"
import UserNotifications from "@/features/user/components/header/notifications/UserNotifications"

const Header: React.FC<{
   sidebarOpen: boolean
   onMenuClick: () => void
}> = ({ sidebarOpen, onMenuClick }) => {
   const user = useSelector((state: RootState) => state.auth.user)
   const company = useSelector((state: RootState) => state.auth.company)

   const displayName = user
      ? `${user.firstName} ${user.lastName}`
      : (company?.companyName ?? "")
   const email = user?.email ?? company?.email ?? ""
   const avatar = user?.profilePicUrl || company?.logoUrl || undefined
   const initials = getInitials(displayName)

   return (
      <AppBar
         className="fixed inset-x-0 top-0 z-50 shadow lg:left-56.25 lg:w-[calc(100%-225px)]"
         color="primary">
         <Toolbar className="min-w-0! gap-1! px-2! sm:gap-3! sm:px-6!">
            <IconButton
               className="lg:hidden!"
               aria-controls="user-navigation"
               aria-expanded={sidebarOpen}
               aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
               color="inherit"
               onClick={onMenuClick}>
               <MenuRounded />
            </IconButton>
            <Typography className="hidden flex-1! text-lg! font-semibold! sm:block">
               SRP
            </Typography>
            <Box className="ml-auto flex min-w-0 items-center">
               {user && <UserNotifications />}
               <Box className="ml-1 flex min-w-0 items-center">
                  <Avatar
                     alt={displayName}
                     src={avatar}>
                     {initials}
                  </Avatar>
                  <Box className="ml-1 hidden max-w-40 min-w-0 flex-col sm:flex">
                     <Typography className="truncate! text-base!">
                        {displayName}
                     </Typography>
                     <Typography className="truncate! text-xs!">{email}</Typography>
                  </Box>
               </Box>
            </Box>
         </Toolbar>
      </AppBar>
   )
}

export default Header
