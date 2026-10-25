import { Box, Button, Typography } from "@mui/material"

type Props = {
   onMarkAllAsRead: () => void
   isMarkingAllAsRead: boolean
}

const NotificationHeader = ({ onMarkAllAsRead, isMarkingAllAsRead }: Props) => {
   return (
      <Box className="flex items-center justify-between px-5 py-4">
         <Typography
            className="text-base!"
            variant="subtitle1">
            Notifications
         </Typography>

         <Button
            className="min-w-0! p-2! text-xs! normal-case!"
            disabled={isMarkingAllAsRead}
            size="small"
            onClick={onMarkAllAsRead}>
            Mark all as read
         </Button>
      </Box>
   )
}

export default NotificationHeader
