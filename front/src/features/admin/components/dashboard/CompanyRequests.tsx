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
      <Box className="bg-surface overflow-hidden rounded-xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
         {/* Header */}
         <Box className="flex items-center justify-between px-5 py-5">
            <Box className="flex items-center gap-2">
               <Typography className="text-base font-semibold text-[#16213D]">
                  Company Requests
               </Typography>
            </Box>

            <Typography
               component="button"
               onClick={onViewAll}
               className="text-link hover:text-link-hover cursor-pointer border-0 bg-transparent text-xs font-medium hover:underline">
               View all
            </Typography>
         </Box>

         {/* Table */}
         <Box
            className="responsive-scroll-region overflow-x-auto px-4 pb-4"
            role="region"
            aria-label="Company requests; scroll horizontally to see all columns"
            tabIndex={0}>
            <Table
               size="small"
               sx={{
                  minWidth: 560
               }}>
               <TableHead>
                  <TableRow
                     sx={{
                        backgroundColor: "#F8F9FC"
                     }}>
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
                              borderBottom: "1px solid #1d4ed8"
                           },
                           "&:last-child td": {
                              borderBottom: 0
                           }
                        }}>
                        {/* Company */}
                        <TableCell>
                           <Box className="flex items-center gap-2">
                              <Avatar
                                 src={getLogoUrl(request.logoUrl)}
                                 alt={request.companyName}
                                 sx={{
                                    width: 28,
                                    height: 28,
                                    fontSize: 11
                                 }}
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
