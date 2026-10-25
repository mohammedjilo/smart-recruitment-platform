import { Box, Button, Paper, Typography } from "@mui/material"
import { Link } from "react-router-dom"

const AccountDeactivatedPage = () => (
   <Box className="bg-bg flex min-h-screen items-center justify-center px-4 py-10">
      <Paper
         className="border-border! bg-surface! w-full max-w-lg rounded-2xl! border! p-8! text-center shadow-sm!"
         elevation={0}>
         <Typography
            className="text-content! font-bold!"
            component="h1"
            variant="h4">
            Account Deactivated
         </Typography>

         <Typography className="mt-4! text-sm! leading-6!" color="textSecondary">
            Your account has been deactivated by an administrator. You no longer have
            access to the platform. Your account information has not been deleted.
         </Typography>

         <Box className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
               className="normal-case!"
               component={Link}
               to="/support-access/verify"
               variant="contained">
               Contact Support
            </Button>
            <Button
               className="normal-case!"
               component={Link}
               to="/login"
               variant="outlined">
               Back to Login
            </Button>
         </Box>
      </Paper>
   </Box>
)

export default AccountDeactivatedPage
