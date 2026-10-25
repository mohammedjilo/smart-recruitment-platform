import CallOutlinedIcon from "@mui/icons-material/CallOutlined"
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined"
import CloseIcon from "@mui/icons-material/Close"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import { Box, Button, Typography } from "@mui/material"

import type { DataTableColumn } from "@/components/common/DataTable"
import CompanyApprovalStatusChip from "@/components/common/CompanyApprovalStatusChip"
import CompanyStatusChip from "@/components/common/CompanyStatusChip"
import CompanyRequestAvatar from "@/features/admin/components/companyRequests/CompanyRequestAvatar"
import type { CompanyRequests } from "@/types/admin"
import formatCreatedAt, { formatDate } from "@/utils/formatDate"

type GetCompanyRequestsColumnsArgs = {
   onView: (company: CompanyRequests) => void
   onApprove: (company: CompanyRequests) => void
   onReject: (company: CompanyRequests) => void
   isUpdating?: boolean
}

export const getCompanyRequestsColumns = ({
   onView,
   onApprove,
   onReject,
   isUpdating = false
}: GetCompanyRequestsColumnsArgs): DataTableColumn<CompanyRequests>[] => [
   {
      id: "company",
      header: "Company",
      width: 240,
      render: company => (
         <Box className="flex items-center gap-3">
            <CompanyRequestAvatar
               companyName={company.companyName}
               logoUrl={company.logoUrl}
            />
            <Box className="min-w-0">
               <Typography className="text-sm! font-semibold! wrap-break-word!">
                  {company.companyName}
               </Typography>
               <Typography
                  className="mt-1! line-clamp-1! text-xs!"
                  color="textSecondary">
                  {company.email}
               </Typography>
            </Box>
         </Box>
      )
   },
   {
      id: "contact-info",
      header: "Contact Info",
      width: 220,
      render: company => (
         <Box className="min-w-0 space-y-1">
            <Typography className="line-clamp-1! text-sm! font-medium!">
               {company.email}
            </Typography>
            <Box className="flex items-center gap-1">
               <CallOutlinedIcon className="size-3.5! text-[#5425D4]!" />
               <Typography
                  className="text-xs! wrap-break-word!"
                  color="textSecondary">
                  {company.phone}
               </Typography>
            </Box>
            <Box className="flex items-center gap-1">
               <LocationOnOutlinedIcon className="size-3.5! text-[#5425D4]!" />
               <Typography
                  className="text-xs! wrap-break-word!"
                  color="textSecondary">
                  {company.location || "Not provided"}
               </Typography>
            </Box>
         </Box>
      )
   },
   {
      id: "status",
      header: "Status",
      width: 100,
      render: company => <CompanyStatusChip status={company.status} />
   },
   {
      id: "approval-status",
      header: "Approval Status",
      width: 140,
      render: company => <CompanyApprovalStatusChip status={company.approvalStatus} />
   },
   {
      id: "requested-on",
      header: "Requested On",
      width: 140,
      render: company => (
         <Box className="contents">
            <Typography className="text-sm! font-medium!">
               {formatCreatedAt(company.createdAt)}
            </Typography>
            <Typography
               className="mt-1! text-xs!"
               color="textSecondary">
               {formatDate(company.createdAt, true).split(",").slice(-1)[0]}
            </Typography>
         </Box>
      )
   },
   {
      id: "reviewed-on",
      header: "Reviewed On",
      width: 140,
      render: company =>
         company.reviewedAt ? (
            <Box>
               <Typography className="text-sm! font-medium!">
                  {formatCreatedAt(company.reviewedAt)}
               </Typography>
               <Typography
                  className="text-muted mt-1! text-xs!"
                  color="textSecondary">
                  Reviewed by Admin
               </Typography>
            </Box>
         ) : (
            <Typography className="text-muted">—</Typography>
         )
   },
   {
      id: "actions",
      header: "Actions",
      width: 400,
      render: company => {
         const isPending = company.approvalStatus === "PENDING"
         const isApproved = company.approvalStatus === "APPROVED"
         const isRejected = company.approvalStatus === "REJECTED"

         return (
            <Box className="flex flex-wrap items-center gap-2">
               <Button
                  className="min-w-22! rounded-lg! text-xs! font-medium! normal-case!"
                  color="primary"
                  size="small"
                  startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                  variant="text"
                  onClick={() => onView(company)}>
                  View
               </Button>
               {isPending && (
                  <Box className="contents">
                     <Button
                        className="bg-surface! rounded-md! border-[#86EFAC]! text-[#15803D]! normal-case!"
                        disabled={isUpdating}
                        size="small"
                        startIcon={<CheckCircleOutlinedIcon fontSize="small" />}
                        variant="outlined"
                        onClick={() => onApprove(company)}>
                        Approve
                     </Button>
                     <Button
                        className="bg-surface! rounded-md! border-[#FCA5A5]! text-[#DC2626]! normal-case!"
                        disabled={isUpdating}
                        size="small"
                        startIcon={<CloseIcon fontSize="small" />}
                        variant="outlined"
                        onClick={() => onReject(company)}>
                        Reject
                     </Button>
                  </Box>
               )}
               {isApproved && (
                  <Button
                     className="bg-surface!"
                     disabled
                     size="small"
                     startIcon={<CheckCircleOutlinedIcon fontSize="small" />}>
                     Approved
                  </Button>
               )}
               {isRejected && (
                  <Button
                     className="bg-surface!"
                     disabled
                     size="small"
                     startIcon={<CloseIcon fontSize="small" />}>
                     Rejected
                  </Button>
               )}
            </Box>
         )
      }
   }
]
