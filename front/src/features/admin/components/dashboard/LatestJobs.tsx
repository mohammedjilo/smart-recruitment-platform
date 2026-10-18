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

import WorkOutlinedIcon from "@mui/icons-material/WorkOutlined"
import type { DashboardJob } from "@/types/admin"
import { getLogoUrl } from "@/utils/dashboard.utils"
import formatCreatedAt from "@/utils/formatDate"

interface LatestJobsProps {
   jobs: DashboardJob[]
   onViewAll?: () => void
}

export default function LatestJobs({ jobs, onViewAll }: LatestJobsProps) {
   return (
      <Box className="bg-surface overflow-hidden rounded-xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
         {/* Header */}
         <Box className="flex items-center justify-between px-5 py-5">
            <Typography className="text-base! font-semibold! text-[#16213D]">
               Latest Jobs
            </Typography>

            <Typography
               component="button"
               onClick={onViewAll}
               className="text-link hover:text-link-hover cursor-pointer border-0 bg-transparent text-xs font-medium hover:underline">
               View all
            </Typography>
         </Box>

         <Box
            className="responsive-scroll-region overflow-x-auto px-4 pb-4"
            role="region"
            aria-label="Latest jobs; scroll horizontally to see all columns"
            tabIndex={0}>
            <Table
               size="small"
               sx={{
                  minWidth: 450
               }}>
               <TableHead>
                  <TableRow
                     sx={{
                        backgroundColor: "#F8F9FC"
                     }}>
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

                     <TableCell>
                        <Typography className="text-muted text-[11px]! font-semibold!">
                           Posted At
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
                  {jobs.slice(0, 5).map(job => (
                     <TableRow
                        key={job.id}
                        hover
                        sx={{
                           "&:not(:last-child) td": {
                              borderBottom: "1px solid #1d4ed8"
                           },
                           "&:last-child td": {
                              borderBottom: 0
                           }
                        }}>
                        <TableCell>
                           <Typography className="text-[11px]! font-medium! whitespace-nowrap!">
                              {job.title}
                           </Typography>
                        </TableCell>

                        <TableCell>
                           <Box className="flex items-center gap-2">
                              <Avatar
                                 src={getLogoUrl(job.company.logoUrl)}
                                 alt={job.company.companyName}
                                 sx={{
                                    width: 25,
                                    height: 25
                                 }}
                              />

                              <Typography className="text-[11px]! whitespace-nowrap!">
                                 {job.company.companyName}
                              </Typography>
                           </Box>
                        </TableCell>

                        <TableCell>
                           <Typography className="text-[11px]! whitespace-nowrap!">
                              {formatCreatedAt(job.createdAt)}
                           </Typography>
                        </TableCell>

                        <TableCell align="right">
                           <Typography className="text-xs! font-semibold! text-[#5936E8]">
                              {job._count.applications}
                           </Typography>
                        </TableCell>
                     </TableRow>
                  ))}

                  {jobs.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={4}>
                           <Box className="flex items-center justify-center py-8">
                              <WorkOutlinedIcon
                                 sx={{
                                    color: "#CBD5E1",
                                    mr: 1
                                 }}
                              />

                              <Typography className="text-muted text-sm">
                                 No jobs found
                              </Typography>
                           </Box>
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </Box>
      </Box>
   )
}
