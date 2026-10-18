import { Badge, IconButton } from "@mui/material"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"

type Props = {
   unreadCount: number
   onClick: (event: React.MouseEvent<HTMLElement>) => void
}

const NotificationButton = ({ unreadCount, onClick }: Props) => {
   return (
      <IconButton
         onClick={onClick}
         size="small"
         className="h-10.5! w-10.5! text-white!">
         <Badge
            badgeContent={unreadCount}
            color="error"

            max={99}
            className="[&_.MuiBadge-badge]:h-4! [&_.MuiBadge-badge]:min-w-4! [&_.MuiBadge-badge]:p-0! [&_.MuiBadge-badge]:text-[9px]! [&_.MuiBadge-badge]:font-semibold!"
            overlap="circular">
            <NotificationsNoneIcon />
         </Badge>
      </IconButton>
   )
}

export default NotificationButton
