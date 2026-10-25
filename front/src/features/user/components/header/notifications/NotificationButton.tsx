import { Badge, IconButton } from "@mui/material"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"

type Props = {
   unreadCount: number
   onClick: (event: React.MouseEvent<HTMLElement>) => void
}

const NotificationButton = ({ unreadCount, onClick }: Props) => {
   return (
      <IconButton
         className="h-10.5! w-10.5! text-white!"
         size="small"
         onClick={onClick}>
         <Badge
            className="[&_.MuiBadge-badge]:h-4! [&_.MuiBadge-badge]:min-w-4! [&_.MuiBadge-badge]:p-0! [&_.MuiBadge-badge]:text-[9px]! [&_.MuiBadge-badge]:font-semibold!"
            badgeContent={unreadCount}

            color="error"
            max={99}
            overlap="circular">
            <NotificationsNoneIcon />
         </Badge>
      </IconButton>
   )
}

export default NotificationButton
