import { Box, Typography } from "@mui/material"

import formatCreatedAt from "@/utils/formatDate"
import type { Company } from "@/types/company"
import CompanyStatusChip from "@/components/common/CompanyStatusChip"

type CompanyDetailsCardProps = {
   company: Company
}

type DetailItemProps = {
   label: string
   value: React.ReactNode
}

const DetailItem = ({ label, value }: DetailItemProps) => {
   return (
      <Box className="flex flex-col gap-2 border-b border-border py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
         <Typography className="text-sm!">{label}</Typography>

         <Box>
            {typeof value === "string" ? (
               <Typography
                  className="text-sm! font-medium! break-all! sm:text-right!"
                  color="textSecondary">
                  {value}
               </Typography>
            ) : (
               value
            )}
         </Box>
      </Box>
   )
}

const CompanyDetailsCard = ({ company }: CompanyDetailsCardProps) => {
   return (
      <Box className="rounded-xl border bg-surface p-6">
         <Typography className="text-lg! font-semibold! text-content">
            Company Details
         </Typography>

         <Box className="mt-4">
            <DetailItem
               value={company.companyName}
               label="Company Name"
            />

            <DetailItem
               value={company.email}
               label="Email"
            />

            <DetailItem
               value={company.phone}
               label="Phone"
            />

            <DetailItem
               value={company.website || "Not provided"}
               label="Website"
            />

            <DetailItem
               value={company.location || "Not provided"}
               label="Location"
            />

            <DetailItem
               value={<CompanyStatusChip status={company.status} />}
               label="Status"
            />

            <DetailItem
               value={formatCreatedAt(company.createdAt)}
               label="Created At"
            />

            <DetailItem
               value={formatCreatedAt(company.updatedAt)}
               label="Updated At"
            />
         </Box>
      </Box>
   )
}

export default CompanyDetailsCard
