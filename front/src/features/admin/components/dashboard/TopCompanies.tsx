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

import BarChartIcon from "@mui/icons-material/BarChart"
import type { TopCompany } from "@/types/admin"
import CompanyStatusChip from "@/components/common/CompanyStatusChip"
import { getLogoUrl } from "@/utils/dashboard.utils"

interface TopCompaniesProps {
   companies: TopCompany[]
}

export default function TopCompanies({ companies }: TopCompaniesProps) {
   return (
      <Box className="bg-surface border-border overflow-hidden rounded-xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
         {/* Header */}
         <Box className="flex items-center gap-3 px-5 py-5">
            <BarChartIcon className="text-xl! text-[#5936E8]!" />

            <Typography className="text-base font-semibold text-[#16213D]">
               Top Companies by Jobs Posted
            </Typography>
         </Box>

         <Box
            className="responsive-scroll-region overflow-x-auto px-4 pb-4"
            aria-label="Top companies by jobs posted; scroll horizontally to see all columns"
            role="region"
            tabIndex={0}>
            <Table
               className="min-w-120!"
               size="small">
               <TableHead>
                  <TableRow className="bg-[#F8F9FC]!">
                     <TableCell className="w-10!">
                        <Typography className="text-muted text-[11px]! font-semibold!">
                           #
                        </Typography>
                     </TableCell>

                     <TableCell>
                        <Typography className="text-muted text-[11px]! font-semibold!">
                           Company
                        </Typography>
                     </TableCell>

                     <TableCell align="right">
                        <Typography className="text-muted text-[11px]! font-semibold!">
                           Jobs Posted
                        </Typography>
                     </TableCell>
                  </TableRow>
               </TableHead>

               <TableBody>
                  {companies.slice(0, 5).map((company, index) => (
                     <TableRow
                        key={company.id}
                        hover
                        sx={{
                           "&:not(:last-child) td": {
                              borderBottom: "1px solid #E2E8F0"
                           },
                           "&:last-child td": {
                              borderBottom: 0
                           }
                        }}>
                        <TableCell>
                           <Typography className="text-content text-[11px]! font-medium!">
                              {index + 1}
                           </Typography>
                        </TableCell>

                        <TableCell>
                           <Box className="flex items-center gap-3">
                              <Avatar
                                 className="h-7! w-7!"
                                 alt={company.companyName}
                                 src={getLogoUrl(company.logoUrl)}
                              />

                              <Box>
                                 <Typography className="text-[11px]! font-medium! text-[#16213D]">
                                    {company.companyName}
                                 </Typography>

                                 <Typography
                                    className="text-muted text-[10px]!"
                                    component="div">
                                    <CompanyStatusChip status={company.status} />
                                 </Typography>
                              </Box>
                           </Box>
                        </TableCell>

                        <TableCell align="right">
                           <Typography className="text-xs! font-semibold! text-[#5936E8]">
                              {company._count.jobs}
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
