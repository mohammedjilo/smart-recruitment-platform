import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined"

import { Box, Typography } from "@mui/material"

import type { Company } from "@/types/company"
import type { CompanyApprovalStatus } from "@/types/admin"
import formatCreatedAt from "@/utils/formatDate"
import CompanyApprovalStatusChip from "@/components/common/CompanyApprovalStatusChip"
import CompanyStatusChip from "@/components/common/CompanyStatusChip"

type Props = {
   company: Company & {
      approvalStatus: CompanyApprovalStatus
   }
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => {
   return (
      <Box className="flex flex-col gap-2 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
         <Typography className="text-sm!">{label}</Typography>

         {typeof value === "string" ? (
            <Typography
               className="text-right! text-sm! font-medium! break-all! text-content"
               color="textSecondary">
               {value}
            </Typography>
         ) : (
            value
         )}
      </Box>
   )
}

const CompanyAccountInformation = ({ company }: Props) => {
   return (
      <Box className="rounded-xl border bg-surface p-5 shadow-sm">
         <Box className="flex items-center gap-3">
            <ManageAccountsOutlinedIcon
               className="text-muted"
               fontSize="small"
            />

            <Typography className="text-[16px]! font-semibold! text-content">
               Account Information
            </Typography>
         </Box>

         <Box className="mt-4">
            <InfoRow
               value={company.id}
               label="Company ID"
            />

            <InfoRow
               value={formatCreatedAt(company.createdAt)}
               label="Registration Date"
            />

            <InfoRow
               value={<CompanyApprovalStatusChip status={company.approvalStatus} />}
               label="Approval Status"
            />

            <InfoRow
               value={<CompanyStatusChip status={company.status} />}
               label="Account Status"
            />

            <InfoRow
               value={formatCreatedAt(company.updatedAt)}
               label="Last Updated"
            />
         </Box>
      </Box>
   )
}

export default CompanyAccountInformation
