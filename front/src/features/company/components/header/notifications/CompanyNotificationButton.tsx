import { Badge, IconButton } from "@mui/material"
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined"

type Props = {
   unreadCount: number
   onClick: (event: React.MouseEvent<HTMLElement>) => void
}

const CompanyNotificationButton = ({ unreadCount, onClick }: Props) => {
   return (
      <IconButton
         onClick={onClick}
         className="h-11! w-11! text-white!">
         <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            className="[&_.MuiBadge-badge]:h-4! [&_.MuiBadge-badge]:min-w-4! [&_.MuiBadge-badge]:p-0! [&_.MuiBadge-badge]:text-[9px]! [&_.MuiBadge-badge]:font-semibold!">
            <NotificationsNoneOutlinedIcon className="text-[25px]!" />
         </Badge>
      </IconButton>
   )
}

export default CompanyNotificationButton
