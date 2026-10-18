import CallOutlinedIcon from "@mui/icons-material/CallOutlined"
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined"
import CloseIcon from "@mui/icons-material/Close"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"

import { Box, Button, TableCell, TableRow, Typography } from "@mui/material"

import CompanyRequestAvatar from "./CompanyRequestAvatar"
import StatusChip from "./StatusChip"
import type { CompanyRequests } from "@/types/admin"
import formatCreatedAt from "@/utils/formatDate"
import { formatDate } from "@/utils/companyRequests.utils"

type CompanyRequestRowProps = {
   company: CompanyRequests
   onView: (company: CompanyRequests) => void
   onApprove: (company: CompanyRequests) => void
   onReject: (company: CompanyRequests) => void
}

const CompanyRequestRow = ({
   company,
   onView,
   onApprove,
   onReject
}: CompanyRequestRowProps) => {
   const isPending = company.approvalStatus === "PENDING"

   const isApproved = company.approvalStatus === "APPROVED"

   const isRejected = company.approvalStatus === "REJECTED"

   return (
      <TableRow
         hover
         sx={{
            "& td": {
               borderBottom: "1px solid #E2E8F0"
            }
         }}>
         {/* Company */}
         <TableCell>
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
                     className="mt-1! text-xs! break-all!"
                     color="textSecondary">
                     {company.email}
                  </Typography>
               </Box>
            </Box>
         </TableCell>

         {/* Contact */}
         <TableCell>
            <Box className="min-w-0 space-y-1">
               <Typography className="text-xs! font-medium! break-all!">
                  {company.email}
               </Typography>

               <Box className="flex items-center gap-1">
                  <CallOutlinedIcon
                     sx={{
                        fontSize: 14,
                        color: "#5425D4"
                     }}
                  />

                  <Typography
                     className="text-xs! wrap-break-word!"
                     color="textSecondary">
                     {company.phone}
                  </Typography>
               </Box>

               <Box className="flex items-center gap-1">
                  <LocationOnOutlinedIcon
                     sx={{
                        fontSize: 14,
                        color: "#5425D4"
                     }}
                  />

                  <Typography
                     className="text-xs! wrap-break-word!"
                     color="textSecondary">
                     {company.location || "Not provided"}
                  </Typography>
               </Box>
            </Box>
         </TableCell>

         {/* Status */}
         <TableCell>
            <StatusChip value={company.status} />
         </TableCell>

         {/* Approval Status */}
         <TableCell>
            <StatusChip value={company.approvalStatus} />
         </TableCell>

         {/* Requested On */}
         <TableCell>
            <Typography className="text-sm! font-medium!">
               {formatCreatedAt(company.createdAt)}
            </Typography>

            <Typography
               className="mt-1! text-xs!"
               color="textSecondary">
               {formatDate(company.createdAt, true).split(",").slice(-1)[0]}
            </Typography>
         </TableCell>

         {/* Reviewed On */}
         <TableCell>
            {company.reviewedAt ? (
               <Box>
                  <Typography className="text-sm! font-medium!">
                     {formatCreatedAt(company.reviewedAt)}
                  </Typography>

                  <Typography className="mt-1! text-xs! text-muted">
                     Reviewed by Admin
                  </Typography>
               </Box>
            ) : (
               <Typography className="text-muted">—</Typography>
            )}
         </TableCell>

         {/* Actions */}
         <TableCell>
            <Box className="flex flex-wrap items-center gap-2">
               <Button
                  className="bg-surface!"
                  size="small"
                  variant="outlined"
                  startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                  onClick={() => onView(company)}
                  sx={{
                     minWidth: 0,
                     textTransform: "none",
                     borderColor: "#C4B5FD",
                     color: "#5425D4",
                     borderRadius: "6px"
                  }}>
                  View
               </Button>

               {isPending && (
                  <>
                     <Button
                        className="bg-surface!"
                        size="small"
                        variant="outlined"
                        startIcon={<CheckCircleOutlinedIcon fontSize="small" />}
                        onClick={() => onApprove(company)}
                        sx={{
                           textTransform: "none",
                           borderColor: "#86EFAC",
                           color: "#15803D",
                           borderRadius: "6px"
                        }}>
                        Approve
                     </Button>

                     <Button
                        className="bg-surface!"
                        size="small"
                        variant="outlined"
                        startIcon={<CloseIcon fontSize="small" />}
                        onClick={() => onReject(company)}
                        sx={{
                           textTransform: "none",
                           borderColor: "#FCA5A5",
                           color: "#DC2626",
                           borderRadius: "6px"
                        }}>
                        Reject
                     </Button>
                  </>
               )}

               {isApproved && (
                  <Button
                     className="bg-surface!"

                     size="small"
                     disabled
                     startIcon={<CheckCircleOutlinedIcon fontSize="small" />}>
                     Approved
                  </Button>
               )}

               {isRejected && (
                  <Button
                     className="bg-surface!"

                     size="small"
                     disabled
                     startIcon={<CloseIcon fontSize="small" />}>
                     Rejected
                  </Button>
               )}
            </Box>
         </TableCell>
      </TableRow>
   )
}

export default CompanyRequestRow
