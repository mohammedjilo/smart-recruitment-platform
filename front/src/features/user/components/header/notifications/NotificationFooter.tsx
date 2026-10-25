import { Box, Button } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

import { useLocation, useNavigate } from "react-router-dom"

type Props = {
   onClick: () => void
}

const NotificationFooter = ({ onClick }: Props) => {
   const navigate = useNavigate()
   const location = useLocation()

   const handleClick = () => {
      onClick()
      navigate(
         location.pathname.startsWith("/admin")
            ? "/admin/notifications"
            : "/notifications"
      )
   }

   return (
      <Box className="border-t border-border px-4 py-2">
         <Button
            className="w-full! py-2! text-[13px]! font-medium! normal-case!"
            endIcon={<ArrowForwardIcon />}
            onClick={handleClick}>
            View all notifications
         </Button>
      </Box>
   )
}

export default NotificationFooter
