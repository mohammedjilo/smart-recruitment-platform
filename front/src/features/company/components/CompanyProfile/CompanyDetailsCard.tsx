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
               label="Company Name"
               value={company.companyName}
            />

            <DetailItem
               label="Email"
               value={company.email}
            />

            <DetailItem
               label="Phone"
               value={company.phone}
            />

            <DetailItem
               label="Website"
               value={company.website || "Not provided"}
            />

            <DetailItem
               label="Location"
               value={company.location || "Not provided"}
            />

            <DetailItem
               label="Status"
               value={<CompanyStatusChip status={company.status} />}
            />

            <DetailItem
               label="Created At"
               value={formatCreatedAt(company.createdAt)}
            />

            <DetailItem
               label="Updated At"
               value={formatCreatedAt(company.updatedAt)}
            />
         </Box>
      </Box>
   )
}

export default CompanyDetailsCard
