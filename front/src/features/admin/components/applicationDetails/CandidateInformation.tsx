import { Avatar, Box, Typography } from "@mui/material"

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"

import ApplicationStatusChip from "@/components/common/ApplicationStatusChip"
import type { AdminApplicationDetails } from "@/types/admin"
import { getInitials } from "@/utils/string/getInitials"

type CandidateInformationProps = {
   application: AdminApplicationDetails
}

const CandidateInformation = ({ application }: CandidateInformationProps) => {
   const { user } = application

   const fullName = `${user.firstName} ${user.lastName}`

   const initials = getInitials(`${user.firstName} ${user.lastName}`)

   return (
      <Box className="flex flex-col gap-5 sm:flex-row sm:items-start">
         <Avatar
            className="bg-primary/10 text-primary h-20 w-20 text-2xl font-bold"
            alt={fullName}
            src={user.profilePicUrl ?? undefined}>
            {initials}
         </Avatar>

         <Box>
            <Box className="flex flex-wrap items-center gap-3">
               <Typography className="font-bold! text-content">{fullName}</Typography>

               <ApplicationStatusChip status={application.status} />
            </Box>

            <Box className="mt-3 space-y-2">
               <ContactItem
                  value={user.email}
                  icon={<EmailOutlinedIcon />}
               />

               <ContactItem
                  value={user.phone}
                  icon={<PhoneOutlinedIcon />}
               />

               <ContactItem
                  value={user.country}
                  icon={<LocationOnOutlinedIcon />}
               />
            </Box>
         </Box>
      </Box>
   )
}

type ContactItemProps = {
   icon: React.ReactNode
   value: string
}

const ContactItem = ({ icon, value }: ContactItemProps) => {
   return (
      <Box className="flex items-center gap-2">
         <Box className="flex h-4 w-4 items-center justify-center">{icon}</Box>

         <Typography
            className="text-xs! font-medium!"
            color="textSecondary">
            {value}
         </Typography>
      </Box>
   )
}

export default CandidateInformation
