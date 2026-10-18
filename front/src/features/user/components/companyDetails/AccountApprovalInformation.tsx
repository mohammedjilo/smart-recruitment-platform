import { Box, Typography } from "@mui/material"

import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined"
import type { CompanyApprovalStatus, CompanyStatus } from "@/types/user"
import CompanyApprovalStatusChip from "@/components/common/CompanyApprovalStatusChip"
import CompanyStatusChip from "@/components/common/CompanyStatusChip"
import { formatDate } from "@/utils/formatDate"

type Props = {
   status: CompanyStatus
   approvalStatus: CompanyApprovalStatus
   createdAt: string
   updatedAt: string
}

const AccountApprovalInformation = ({
   status,
   approvalStatus,
   createdAt,
   updatedAt
}: Props) => {
   return (
      <Box className="h-full rounded-xl border border-border bg-surface p-6 shadow-sm">
         <Box className="flex items-center gap-4">
            <Box className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
               <VerifiedUserOutlinedIcon className="text-violet-600" />
            </Box>

            <Typography className="text-base! font-bold! text-content">
               Account & Approval Information
            </Typography>
         </Box>

         <Box className="mt-6 space-y-4">
            <Box className="grid grid-cols-[1fr_auto] items-center gap-4">
               <Typography className="text-sm! font-medium!">Account Status</Typography>

               <CompanyStatusChip status={status} />
            </Box>

            <Box className="grid grid-cols-[1fr_auto] items-center gap-4">
               <Typography className="text-sm! font-medium!">Approval Status</Typography>

               <CompanyApprovalStatusChip status={approvalStatus} />
            </Box>

            <Box className="grid grid-cols-[1fr_auto] items-center gap-4">
               <Typography className="text-sm! font-medium!">Joined At</Typography>

               <Typography
                  className="text-sm!"
                  color="textSecondary">
                  {formatDate(createdAt)}
               </Typography>
            </Box>

            <Box className="grid grid-cols-[1fr_auto] items-center gap-4">
               <Typography className="text-sm! font-medium!">Last Updated</Typography>

               <Typography
                  className="text-sm!"
                  color="textSecondary">
                  {formatDate(updatedAt)}
               </Typography>
            </Box>
         </Box>
      </Box>
   )
}

export default AccountApprovalInformation
