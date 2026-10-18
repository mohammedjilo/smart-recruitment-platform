import { Box, Typography } from "@mui/material"
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined"

const SupportHeader = () => (
   <Box className="flex items-start gap-3">
      <Box className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
         <SupportAgentOutlinedIcon />
      </Box>
      <Box>
         <Typography className="text-2xl! font-bold! text-content!">Support</Typography>
         <Typography className="mt-1! text-sm! text-muted!">
            Manage and respond to user and company support requests.
         </Typography>
      </Box>
   </Box>
)

export default SupportHeader
