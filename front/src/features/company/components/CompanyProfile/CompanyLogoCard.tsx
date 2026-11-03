import { Avatar, Box, Typography } from "@mui/material"
import type { Company } from "@/types/company"
import { getInitials } from "@/utils/string/getInitials"

type CompanyLogoCardProps = {
   company: Company
}

const CompanyLogoCard = ({ company }: CompanyLogoCardProps) => {
   return (
      <Box className="bg-surface rounded-xl border p-6">
         <Box className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <Box className="min-w-70">
               <Typography className="text-content text-lg! font-semibold!">
                  Company Logo
               </Typography>

               <Typography className="text-muted mt-2! text-sm!">
                  This logo will be displayed on your job postings and company profile.
               </Typography>
            </Box>

            <Avatar
               className="h-18.5! w-18.5! rounded-[10px]! border! border-[#E2E8F0]! bg-[#F5F3FF]! text-[22px]! font-bold! text-[#5425d4]!"
               alt={company.companyName}
               src={company.logoUrl ?? undefined}
               variant="rounded">
               {getInitials(company.companyName)}
            </Avatar>
         </Box>
      </Box>
   )
}

export default CompanyLogoCard
