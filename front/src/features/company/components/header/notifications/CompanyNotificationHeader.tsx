import { Box, Button, Typography } from "@mui/material"

type Props = {
   onMarkAllAsRead: () => Promise<void>
   isMarkingAllAsRead: boolean
}

const CompanyNotificationHeader = ({ onMarkAllAsRead, isMarkingAllAsRead }: Props) => {
   return (
      <Box className="flex items-center justify-between px-5 py-3.5">
         <Typography
            variant="subtitle2"
            className="font-semibold! text-content!">
            Notifications
         </Typography>

         <Button
            size="small"
            onClick={onMarkAllAsRead}
            disabled={isMarkingAllAsRead}
            className="min-w-0! p-2! text-xs! text-white! normal-case!">
            Mark all as read
         </Button>
      </Box>
   )
}

export default CompanyNotificationHeader
