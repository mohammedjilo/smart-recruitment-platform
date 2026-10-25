import {
   Avatar,
   Box,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableRow,
   Typography
} from "@mui/material"

import type { CompanyRequest } from "@/types/admin"
import { getCompanyLocation, getLogoUrl } from "@/utils/dashboard.utils"
import formatCreatedAt from "@/utils/formatDate"

interface CompanyRequestsProps {
   requests: CompanyRequest[]
   onViewAll?: () => void
}

export default function CompanyRequests({ requests, onViewAll }: CompanyRequestsProps) {
   return (
      <Box className="bg-surface border-border overflow-hidden rounded-xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
         {/* Header */}
         <Box className="flex items-center justify-between px-5 py-5">
            <Box className="flex items-center gap-2">
               <Typography className="text-base font-semibold text-[#16213D]">
                  Company Requests
               </Typography>
            </Box>

            <Typography
               className="text-link hover:text-link-hover cursor-pointer border-0 bg-transparent text-xs font-medium hover:underline"
               component="button"
               onClick={onViewAll}>
               View all
            </Typography>
         </Box>

         {/* Table */}
         <Box
            className="responsive-scroll-region overflow-x-auto px-4 pb-4"
            aria-label="Company requests; scroll horizontally to see all columns"
            role="region"
            tabIndex={0}>
            <Table
               className="min-w-140!"
               size="small">
               <TableHead>
                  <TableRow className="bg-[#F8F9FC]!">
                     <TableCell>
                        <Typography className="text-muted text-[11px]! font-semibold!">
                           Company Name
                        </Typography>
                     </TableCell>

                     <TableCell>
                        <Typography className="text-muted text-[11px]! font-semibold!">
                           Email
                        </Typography>
                     </TableCell>

                     <TableCell>
                        <Typography className="text-muted text-[11px]! font-semibold!">
                           Location
                        </Typography>
                     </TableCell>

                     <TableCell>
                        <Typography className="text-muted text-[11px]! font-semibold!">
                           Requested At
                        </Typography>
                     </TableCell>
                  </TableRow>
               </TableHead>

               <TableBody>
                  {requests.slice(0, 5).map(request => (
                     <TableRow
                        key={request.id}
                        hover
                        sx={{
                           "&:not(:last-child) td": {
                              borderBottom: "1px solid #E2E8F0"
                           },
                           "&:last-child td": {
                              borderBottom: 0
                           }
                        }}>
                        {/* Company */}
                        <TableCell>
                           <Box className="flex items-center gap-2">
                              <Avatar
                                 className="h-7! w-7! text-[11px]!"
                                 alt={request.companyName}
                                 src={getLogoUrl(request.logoUrl)}
                              />

                              <Typography className="text-[11px]! font-medium! whitespace-nowrap!">
                                 {request.companyName}
                              </Typography>
                           </Box>
                        </TableCell>

                        {/* Email */}
                        <TableCell>
                           <Typography className="text-[11px]! whitespace-nowrap!">
                              {request.email}
                           </Typography>
                        </TableCell>

                        {/* Location */}
                        <TableCell>
                           <Typography className="text-[11px]! whitespace-nowrap!">
                              {getCompanyLocation(request)}
                           </Typography>
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                           <Typography className="text-[11px]! whitespace-nowrap!">
                              {formatCreatedAt(request.createdAt)}
                           </Typography>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </Box>
      </Box>
   )
}
