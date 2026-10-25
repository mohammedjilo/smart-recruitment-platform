import { Box, Typography } from "@mui/material"

export default function ForbiddenPage() {
   return (
      <Box className="flex min-h-80 items-center justify-center">
         <Box className="text-center">
            <Typography className="text-2xl! font-bold! text-content!">403</Typography>
            <Typography className="mt-2! text-sm!" color="textSecondary">
               You do not have permission to access this workspace.
            </Typography>
         </Box>
      </Box>
   )
}
