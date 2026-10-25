import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined"
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import { Avatar, Box, IconButton, Typography } from "@mui/material"

import ProfileInfoItem from "./ProfileInfoItem"
import type { Company } from "@/types/company"
import CompanyStatusChip from "@/components/common/CompanyStatusChip"
import { getInitials } from "@/utils/string/getInitials"
import formatCreatedAt from "@/utils/formatDate"

type CompanyOverviewCardProps = {
   company: Company
   onEdit: () => void
}

const CompanyOverviewCard = ({ company, onEdit }: CompanyOverviewCardProps) => {
   return (
      <Box className="bg-surface rounded-xl border p-6">
         <Box className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)]">
            {/* Company Main Information */}
            <Box className="flex flex-col gap-5 border-b pb-7 xl:flex-row xl:border-r xl:border-b-0 xl:pr-8 xl:pb-0">
               <Box className="relative shrink-0">
                  <Avatar
                     className="h-33! w-33! rounded-xl! bg-[#F5F3FF]! text-3xl! font-bold! text-[#5425d4]! border! border-[#E2E8F0]!"
                     alt={company.companyName}
                     src={company.logoUrl ?? undefined}
                     variant="rounded">
                     {getInitials(company.companyName)}
                  </Avatar>

                  <IconButton
                     className="absolute! -right-2.5! -bottom-2! h-9.5! w-9.5! bg-[#FFFFFF]! shadow-[0_4px_12px_rgba(15,_23,_42,_0.08)]! border! border-[#E2E8F0]!"
                     sx={{
                        "&:hover": {
                           backgroundColor: "#F8FAFC"
                        }
                     }}
                     onClick={onEdit}>
                     <EditOutlinedIcon className="text-lg! text-[#475569]!" />
                  </IconButton>
               </Box>

               <Box className="min-w-0">
                  <Box className="flex flex-wrap items-center gap-3">
                     <Typography className="text-content text-2xl! font-bold!">
                        {company.companyName}
                     </Typography>

                     <CompanyStatusChip status={company.status} />

                     <Typography className="text-muted text-xs!">
                        Member since {formatCreatedAt(company.createdAt)}
                     </Typography>
                  </Box>

                  <Typography className="text-muted mt-5! max-w-md! text-sm! leading-7!">
                     {company.description || "No company description has been added yet."}
                  </Typography>
               </Box>
            </Box>

            {/* Quick Information */}
            <Box className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
               <ProfileInfoItem
                  value={company.companyName}
                  icon={<BusinessOutlinedIcon className="text-xl!" />}
                  label="Company Name"
               />

               <ProfileInfoItem
                  value={company.website || "Not provided"}
                  icon={<LanguageOutlinedIcon className="text-xl!" />}
                  label="Website"
               />

               <ProfileInfoItem
                  value={company.email}
                  icon={<EmailOutlinedIcon className="text-xl!" />}
                  label="Email"
               />

               <ProfileInfoItem
                  value={company.location || "Not provided"}
                  icon={<LocationOnOutlinedIcon className="text-xl!" />}
                  label="Location"
               />

               <ProfileInfoItem
                  value={company.phone}
                  icon={<PhoneOutlinedIcon className="text-xl!" />}
                  label="Phone"
               />

               <ProfileInfoItem
                  value={<CompanyStatusChip status={company.status} />}
                  icon={<SecurityOutlinedIcon className="text-xl!" />}
                  label="Status"
               />
            </Box>
         </Box>
      </Box>
   )
}

export default CompanyOverviewCard
