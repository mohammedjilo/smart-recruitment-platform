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
      <Box className="rounded-xl border bg-surface p-6">
         <Box className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)]">
            {/* Company Main Information */}
            <Box className="flex flex-col gap-5 border-b pb-7 xl:flex-row xl:border-r xl:border-b-0 xl:pr-8 xl:pb-0">
               <Box className="relative shrink-0">
                  <Avatar
                     src={company.logoUrl ?? undefined}
                     alt={company.companyName}
                     variant="rounded"
                     sx={{
                        width: 132,
                        height: 132,
                        borderRadius: "12px",
                        backgroundColor: "#F5F3FF",
                        color: "#5425d4",
                        fontSize: "30px",
                        fontWeight: 700,
                        border: "1px solid #E2E8F0"
                     }}>
                     {getInitials(company.companyName)}
                  </Avatar>

                  <IconButton
                     onClick={onEdit}
                     sx={{
                        position: "absolute",
                        right: -10,
                        bottom: -8,
                        width: 38,
                        height: 38,
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                        "&:hover": {
                           backgroundColor: "#F8FAFC"
                        }
                     }}>
                     <EditOutlinedIcon
                        sx={{
                           fontSize: 18,
                           color: "#475569"
                        }}
                     />
                  </IconButton>
               </Box>

               <Box className="min-w-0">
                  <Box className="flex flex-wrap items-center gap-3">
                     <Typography className="text-2xl! font-bold! text-content">
                        {company.companyName}
                     </Typography>

                     <CompanyStatusChip status={company.status} />

                     <Typography className="text-xs! text-muted">
                        Member since {formatCreatedAt(company.createdAt)}
                     </Typography>
                  </Box>

                  <Typography className="mt-5! max-w-md! text-sm! leading-7! text-muted">
                     {company.description || "No company description has been added yet."}
                  </Typography>
               </Box>
            </Box>

            {/* Quick Information */}
            <Box className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
               <ProfileInfoItem
                  icon={<BusinessOutlinedIcon sx={{ fontSize: 20 }} />}
                  label="Company Name"
                  value={company.companyName}
               />

               <ProfileInfoItem
                  icon={<LanguageOutlinedIcon sx={{ fontSize: 20 }} />}
                  label="Website"
                  value={company.website || "Not provided"}
               />

               <ProfileInfoItem
                  icon={<EmailOutlinedIcon sx={{ fontSize: 20 }} />}
                  label="Email"
                  value={company.email}
               />

               <ProfileInfoItem
                  icon={<LocationOnOutlinedIcon sx={{ fontSize: 20 }} />}
                  label="Location"
                  value={company.location || "Not provided"}
               />

               <ProfileInfoItem
                  icon={<PhoneOutlinedIcon sx={{ fontSize: 20 }} />}
                  label="Phone"
                  value={company.phone}
               />

               <ProfileInfoItem
                  icon={<SecurityOutlinedIcon sx={{ fontSize: 20 }} />}
                  label="Status"
                  value={<CompanyStatusChip status={company.status} />}
               />
            </Box>
         </Box>
      </Box>
   )
}

export default CompanyOverviewCard
