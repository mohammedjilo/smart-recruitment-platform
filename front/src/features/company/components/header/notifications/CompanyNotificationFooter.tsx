import { Box, Button } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

import { useNavigate } from "react-router-dom"

type Props = {
   onClose: () => void
}

const CompanyNotificationFooter = ({ onClose }: Props) => {
   const navigate = useNavigate()

   const handleClick = () => {
      onClose()
      navigate("/company/notifications")
   }

   return (
      <Box className="border-t border-border px-4 py-1.5">
         <Button
            fullWidth
            onClick={handleClick}
            endIcon={<ArrowForwardIcon className="text-[16px]!" />}
            className="w-full! py-2! text-[12px]! font-medium! text-blue-600! normal-case!">
            View all notifications
         </Button>
      </Box>
   )
}

export default CompanyNotificationFooter
