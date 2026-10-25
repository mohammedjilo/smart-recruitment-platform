import { Box, Typography } from "@mui/material"

import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import type { CompanyProfileDetails } from "@/types/user"
import CompanyApprovalStatusChip from "@/components/common/CompanyApprovalStatusChip"
import CompanyStatusChip from "@/components/common/CompanyStatusChip"
import { formatDate } from "@/utils/formatDate"

type Props = {
   company: CompanyProfileDetails
}

const CompanyDetailsHeader = ({ company }: Props) => {
   return (
      <Box className="border-border bg-surface mb-6 rounded-xl border px-6 py-8 shadow-sm lg:px-8">
         <Box className="flex flex-col gap-8 xl:flex-row xl:items-center">
            {/* Left Side */}
            <Box className="flex min-w-0 flex-1 flex-col gap-6 sm:flex-row sm:items-start">
               {/* Logo */}
               <Box className="border-border bg-bg flex h-37.5 w-37.5 shrink-0 items-center justify-center overflow-hidden rounded-2xl border">
                  {company.logoUrl ? (
                     <img
                        className="h-full w-full object-cover"
                        alt={company.companyName}
                        src={company.logoUrl}
                     />
                  ) : (
                     <BusinessOutlinedIcon className="text-[52px]! text-violet-600" />
                  )}
               </Box>

               {/* Main Information */}
               <Box className="min-w-0 flex-1">
                  <Typography
                     className="text-content! text-[26px]! leading-[1.2]! font-bold! tracking-[-0.02em]!"
                     component="h1">
                     {company.companyName}
                  </Typography>

                  {company.description && (
                     <Typography className="mt-3! max-w-125! text-sm! leading-6!">
                        {company.description}
                     </Typography>
                  )}

                  <Box className="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
                     <Box className="flex items-center gap-3">
                        <PhoneOutlinedIcon className="text-muted text-lg!" />

                        <Typography className="text-sm!">{company.phone}</Typography>
                     </Box>

                     <Box className="flex items-center gap-3">
                        <EmailOutlinedIcon className="text-muted text-lg!" />

                        <Typography className="text-sm! break-all!">
                           {company.email}
                        </Typography>
                     </Box>

                     {company.website && (
                        <Box className="flex items-center gap-3">
                           <LanguageOutlinedIcon className="text-muted text-lg!" />

                           <Typography className="text-sm!">{company.website}</Typography>
                        </Box>
                     )}

                     {company.location && (
                        <Box className="flex items-center gap-3">
                           <LocationOnOutlinedIcon className="text-muted text-lg!" />

                           <Typography className="text-sm!">
                              {company.location}
                           </Typography>
                        </Box>
                     )}
                  </Box>
               </Box>
            </Box>

            {/* Right Side */}
            <Box className="border-border border-t pt-6 xl:w-107.5 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-11">
               <Box className="space-y-4">
                  <Box className="grid grid-cols-[1fr_auto] items-center gap-4">
                     <Typography className="text-sm! font-semibold!">
                        Account Status
                     </Typography>

                     <CompanyStatusChip status={company.status} />
                  </Box>

                  <Box className="grid grid-cols-[1fr_auto] items-center gap-4">
                     <Typography className="text-sm! font-semibold!">
                        Approval Status
                     </Typography>

                     <CompanyApprovalStatusChip status={company.approvalStatus} />
                  </Box>

                  <Box className="grid grid-cols-[1fr_auto] items-center gap-4">
                     <Typography className="text-sm! font-semibold!">
                        Joined At
                     </Typography>

                     <Typography
                        className="text-sm!"
                        color="textSecondary">
                        {formatDate(company.createdAt)}
                     </Typography>
                  </Box>

                  <Box className="grid grid-cols-[1fr_auto] items-center gap-4">
                     <Typography className="text-sm! font-semibold">
                        Last Updated
                     </Typography>

                     <Typography
                        className="text-sm!"
                        color="textSecondary">
                        {formatDate(company.updatedAt)}
                     </Typography>
                  </Box>
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default CompanyDetailsHeader
