import { Box, Button, Typography } from "@mui/material"

type Props = {
   onMarkAllAsRead: () => void
   isMarkingAllAsRead: boolean
}

const NotificationHeader = ({ onMarkAllAsRead, isMarkingAllAsRead }: Props) => {
   return (
      <Box className="flex items-center justify-between px-5 py-4">
         <Typography
            variant="subtitle1"
            className="text-base!">
            Notifications
         </Typography>

         <Button
            size="small"
            onClick={onMarkAllAsRead}
            disabled={isMarkingAllAsRead}
            className="min-w-0! p-2! text-xs! normal-case!">
            Mark all as read
         </Button>
      </Box>
   )
}

export default NotificationHeader
