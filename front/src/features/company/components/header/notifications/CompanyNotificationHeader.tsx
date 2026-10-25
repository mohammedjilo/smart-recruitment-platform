import { Box, Button, Typography } from "@mui/material"

type Props = {
   onMarkAllAsRead: () => Promise<void>
   isMarkingAllAsRead: boolean
}

const CompanyNotificationHeader = ({ onMarkAllAsRead, isMarkingAllAsRead }: Props) => {
   return (
      <Box className="flex items-center justify-between px-5 py-3.5">
         <Typography
            className="font-semibold! text-content!"
            variant="subtitle2">
            Notifications
         </Typography>

         <Button
            className="min-w-0! p-2! text-xs! text-white! normal-case!"
            disabled={isMarkingAllAsRead}
            size="small"
            onClick={onMarkAllAsRead}>
            Mark all as read
         </Button>
      </Box>
   )
}

export default CompanyNotificationHeader
