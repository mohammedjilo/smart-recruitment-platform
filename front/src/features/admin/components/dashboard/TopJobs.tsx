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
import type { DashboardJob } from "@/types/admin"
import { getLogoUrl } from "@/utils/dashboard.utils"

interface TopJobsProps {
   jobs: DashboardJob[]
}

export default function TopJobs({ jobs }: TopJobsProps) {
   return (
      <Box className="bg-surface border-border overflow-hidden rounded-xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
         {/* Header */}
         <Box className="flex items-center gap-3 px-5 py-5">
            <BarChartIcon className="text-xl! text-[#F59E0B]!" />

            <Typography className="text-base font-semibold text-[#16213D]">
               Top Jobs by Applications
            </Typography>
         </Box>

         <Box
            className="responsive-scroll-region overflow-x-auto px-4 pb-4"
            aria-label="Top jobs by applications; scroll horizontally to see all columns"
            role="region"
            tabIndex={0}>
            <Table
               className="min-w-105!"
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
                           Job Title
                        </Typography>
                     </TableCell>

                     <TableCell>
                        <Typography className="text-muted text-[11px]! font-semibold!">
                           Company
                        </Typography>
                     </TableCell>

                     <TableCell align="right">
                        <Typography className="text-muted text-[11px]! font-semibold!">
                           Applications
                        </Typography>
                     </TableCell>
                  </TableRow>
               </TableHead>

               <TableBody>
                  {jobs.slice(0, 5).map((job, index) => (
                     <TableRow
                        key={job.id}
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
                           <Typography className="text-[11px]! font-medium! whitespace-nowrap!">
                              {job.title}
                           </Typography>
                        </TableCell>

                        <TableCell>
                           <Box className="flex items-center gap-2">
                              <Avatar
                                 className="h-6.75! w-6.75!"
                                 alt={job.company.companyName}
                                 src={getLogoUrl(job.company.logoUrl)}
                              />

                              <Typography className="text-[11px]! whitespace-nowrap!">
                                 {job.company.companyName}
                              </Typography>
                           </Box>
                        </TableCell>

                        <TableCell align="right">
                           <Typography className="text-xs! font-semibold! text-[#5936E8]">
                              {job._count.applications}
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
