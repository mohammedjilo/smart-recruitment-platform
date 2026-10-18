import { Avatar, Box, Typography } from "@mui/material"
import type { Company } from "@/types/company"
import { getInitials } from "@/utils/string/getInitials"

type CompanyLogoCardProps = {
   company: Company
}

const CompanyLogoCard = ({ company }: CompanyLogoCardProps) => {
   return (
      <Box className="rounded-xl border bg-surface p-6">
         <Box className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <Box className="min-w-70">
               <Typography className="text-lg! font-semibold! text-content">
                  Company Logo
               </Typography>

               <Typography className="mt-2! text-sm! text-muted">
                  This logo will be displayed on your job postings and company profile.
               </Typography>
            </Box>

            <Avatar
               src={company.logoUrl ?? undefined}
               alt={company.companyName}
               variant="rounded"
               sx={{
                  width: 74,
                  height: 74,
                  borderRadius: "10px",
                  backgroundColor: "#F5F3FF",
                  color: "#5425d4",
                  border: "1px solid #E2E8F0",
                  fontSize: "22px",
                  fontWeight: 700
               }}>
               {getInitials(company.companyName)}
            </Avatar>

            <Box>
               <Typography
                  variant="caption"
                  className="text-xs text-muted">
                  JPG, PNG or SVG. Maximum size of 2MB.
               </Typography>
            </Box>
         </Box>
      </Box>
   )
}

export default CompanyLogoCard
