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
         position="sticky"
         sx={{
            ml: { lg: "268px" },
            width: { xs: "100%", lg: "calc(100% - 268px)" }
         }}
         className="top-0 z-50 border-b border-border">
         <Toolbar className="flex! min-w-0! items-center! justify-between! gap-2! px-3! py-2.5! sm:px-6!">
            <IconButton
               aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
               aria-controls="company-navigation"
               aria-expanded={sidebarOpen}
               onClick={onMenuClick}
               color="inherit"
               className="lg:hidden!">
               <MenuRounded />
            </IconButton>
            <CompanyNotifications />

            <Box className="flex min-w-0 items-center gap-2 rounded-2xl px-1 py-1.5 sm:gap-3 sm:px-2.5">
               <Avatar
                  src={company?.logoUrl ?? undefined}
                  alt={company?.companyName ?? "Company logo"}
                  sx={{
                     width: 46,
                     height: 46,
                     bgcolor: "#e9eefb",
                     color: "#334155",
                     fontSize: 18,
                     fontWeight: 700,
                     border: "1px solid #e2e8f0"
                  }}>
                  {company?.companyName?.charAt(0)?.toUpperCase() || (
                     <BusinessRounded sx={{ fontSize: 18 }} />
                  )}
               </Avatar>

               <Box className="hidden min-w-0 max-w-48 sm:block">
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
