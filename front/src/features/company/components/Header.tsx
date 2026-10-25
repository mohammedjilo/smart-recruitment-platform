import { BusinessRounded } from "@mui/icons-material"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import MenuRounded from "@mui/icons-material/MenuRounded"
import { AppBar, Avatar, Box, IconButton, Toolbar, Typography } from "@mui/material"
import CompanyNotifications from "@/features/company/components/header/notifications/CompanyNotifications"

const Header = ({
   sidebarOpen,
   onMenuClick
}: {
   sidebarOpen: boolean
   onMenuClick: () => void
}) => {
   const company = useSelector((state: RootState) => state.auth.company)

   return (
      <AppBar
         className="border-border top-0 z-50 border-b"
         position="sticky"
         sx={{
            ml: { lg: "268px" },
            width: { xs: "100%", lg: "calc(100% - 268px)" }
         }}>
         <Toolbar className="flex! min-w-0! items-center! justify-between! gap-2! px-3! py-2.5! sm:px-6!">
            <IconButton
               className="lg:hidden!"
               aria-controls="company-navigation"
               aria-expanded={sidebarOpen}
               aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
               color="inherit"
               onClick={onMenuClick}>
               <MenuRounded />
            </IconButton>
            <CompanyNotifications />

            <Box className="flex min-w-0 items-center gap-2 rounded-2xl px-1 py-1.5 sm:gap-3 sm:px-2.5">
               <Avatar
                  className="h-11.5! w-11.5! bg-[#e9eefb]! text-lg! font-bold! text-[#334155]! border! border-[#e2e8f0]!"
                  alt={company?.companyName ?? "Company logo"}
                  src={company?.logoUrl ?? undefined}>
                  {company?.companyName?.charAt(0)?.toUpperCase() || (
                     <BusinessRounded className="text-lg!" />
                  )}
               </Avatar>

               <Box className="hidden max-w-48 min-w-0 sm:block">
                  <Typography className="truncate! text-[16px]! font-semibold!">
                     {company?.companyName || "Company"}
                  </Typography>

                  <Typography className="truncate! text-[13px]!">
                     {company?.email || "company@email.com"}
                  </Typography>
               </Box>
            </Box>
         </Toolbar>
      </AppBar>
   )
}

export default Header
