import { Avatar, Box, IconButton, Typography } from "@mui/material"
import { Close } from "@mui/icons-material"
import type { CompanyApplication } from "@/types/application"

type Props = {
   application: CompanyApplication
   onClose: () => void
}

const ApplicationDetailsHeader = ({ application, onClose }: Props) => (
   <Box className="flex items-start justify-between border-b border-[#E7EAF0] p-5">
      <Box className="flex min-w-0 items-center gap-3">
         <Avatar
            src={application.user.profilePicUrl ?? undefined}
            sx={{ width: 44, height: 44, fontSize: "15px" }}>
            {application.user.firstName.charAt(0)}
         </Avatar>
         <Box className="min-w-0">
            <Typography className="truncate! text-base! font-bold!">
               {application.user.firstName} {application.user.lastName}
            </Typography>
            <Typography className="truncate! text-sm!" color="textSecondary">
               {application.user.email}
            </Typography>
         </Box>
      </Box>
      <IconButton className="shrink-0" size="small" onClick={onClose}>
         <Close fontSize="small" />
      </IconButton>
   </Box>
)

export default ApplicationDetailsHeader
