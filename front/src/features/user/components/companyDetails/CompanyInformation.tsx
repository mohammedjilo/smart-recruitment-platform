import { Box, Typography } from "@mui/material"

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined"
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import type { CompanyProfileDetails } from "@/types/user"

type Props = {
   company: CompanyProfileDetails
}

const CompanyInformation = ({ company }: Props) => {
   return (
      <Box className="h-full rounded-xl border border-border bg-surface p-6 shadow-sm">
         <Box className="flex items-center gap-4 border-b border-border pb-5">
            <Box className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
               <InfoOutlinedIcon className="text-violet-600" />
            </Box>

            <Typography className="text-base! font-bold! text-content">
               Company Information
            </Typography>
         </Box>

         <Box className="mt-5 space-y-4">
            <InformationRow
               icon={<BusinessOutlinedIcon />}
               label="Company Name"
               value={company.companyName}
            />

            <InformationRow
               icon={<EmailOutlinedIcon />}
               label="Email"
               value={company.email}
            />

            <InformationRow
               icon={<PhoneOutlinedIcon />}
               label="Phone"
               value={company.phone}
            />

            <InformationRow
               icon={<LanguageOutlinedIcon />}
               label="Website"
               value={company.website || "—"}
            />

            <InformationRow
               icon={<LocationOnOutlinedIcon />}
               label="Location"
               value={company.location || "—"}
            />
         </Box>
      </Box>
   )
}

type InformationRowProps = {
   icon: React.ReactNode
   label: string
   value: string
}

const InformationRow = ({ icon, label, value }: InformationRowProps) => {
   return (
      <Box className="grid grid-cols-[18px_170px_1fr] items-center gap-3">
         <Box className="flex items-center text-muted">{icon}</Box>

         <Typography className="text-sm!">{label}</Typography>

         <Typography
            className="text-sm! font-medium! break-all!"
            color="textSecondary">
            {value}
         </Typography>
      </Box>
   )
}

export default CompanyInformation
