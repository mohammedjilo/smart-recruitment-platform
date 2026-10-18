import { Box, Typography } from "@mui/material"

import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined"
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined"
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined"
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined"
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined"
import type { ProfileSnapshot } from "@/types/admin"
import { formatExperience } from "@/utils/profileSnapShot.utils"

type SnapshotPersonalInfoProps = {
   snapshot: ProfileSnapshot
}

const SnapshotPersonalInfo = ({ snapshot }: SnapshotPersonalInfoProps) => {
   return (
      <Box className="overflow-hidden rounded-xl border bg-surface">
         <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 [&>*:not(:last-child)]:border-b lg:[&>*:nth-child(-n+4)]:border-b sm:[&>*:nth-child(-n+6)]:border-b lg:[&>*:nth-child(4n+1)]:border-r lg:[&>*:nth-child(4n+2)]:border-r lg:[&>*:nth-child(4n+3)]:border-r lg:[&>*:nth-child(n+5)]:border-b-0 sm:[&>*:nth-child(odd)]:border-r">
            <InfoItem
               icon={<PersonOutlineOutlinedIcon />}
               label="First Name"
               value={snapshot.firstName}
            />

            <InfoItem
               icon={<PersonOutlineOutlinedIcon />}
               label="Last Name"
               value={snapshot.lastName}
            />

            <InfoItem
               icon={<EmailOutlinedIcon />}
               label="Email"
               value={snapshot.email}
            />

            <InfoItem
               icon={<PhoneOutlinedIcon />}
               label="Phone"
               value={snapshot.phone}
            />

            <InfoItem
               icon={<PublicOutlinedIcon />}
               label="Country"
               value={snapshot.country}
            />

            <InfoItem
               icon={<CakeOutlinedIcon />}
               label="Age"
               value={snapshot.age}
            />

            <InfoItem
               icon={<BusinessCenterOutlinedIcon />}
               label="Job Title"
               value={snapshot.jobTitle}
            />

            <InfoItem
               icon={<ScheduleOutlinedIcon />}
               label="Years of Experience"
               value={formatExperience(snapshot.yearsOfExperience)}
            />
         </Box>
      </Box>
   )
}

type InfoItemProps = {
   icon: React.ReactNode
   label: string
   value: string
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => {
   return (
      <Box className="flex min-h-19.5 items-center gap-3 px-5 py-4">
         <Box className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            {icon}
         </Box>

         <Box className="min-w-0">
            <Typography
               className="text-[10px]!"
               color="textSecondary">
               {label}
            </Typography>

            <Typography className="mt-1! truncate! text-xs! font-semibold!">
               {value || "Not specified"}
            </Typography>
         </Box>
      </Box>
   )
}

export default SnapshotPersonalInfo
