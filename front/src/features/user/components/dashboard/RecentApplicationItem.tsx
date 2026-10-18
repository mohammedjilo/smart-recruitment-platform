import React from "react"
import { Box, Typography } from "@mui/material"

import { useNavigate } from "react-router-dom"
import formatCreatedAt from "@/utils/formatDate"
import type { RecentApplication } from "@/types/user"
import ApplicationStatusChip from "@/components/common/ApplicationStatusChip"
import type { ApplicationStatus } from "@/types/common/enums"

export type { ApplicationStatus } from "@/types/common/enums"

interface ApplicationListProps {
   application: RecentApplication
   onApplicationClick?: (application: RecentApplication) => void
}

const RecentApplicationItem: React.FC<ApplicationListProps> = ({ application }) => {
   const navigate = useNavigate()
   return (
      <Box className="border-border bg-surface w-full overflow-hidden rounded-xl border">
         <Box
            key={application.id}
            onClick={() => navigate("/applications")}
            className={`group hover:bg-primary-tint flex min-h-20.5 cursor-pointer items-center gap-6 px-5 py-3 transition-all duration-200`}>
            {/* ================= COMPANY LOGO ================= */}
            <Box className="border-border bg-surface flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
               {application.job.company.logoUrl ? (
                  <img
                     src={application.job.company.logoUrl}
                     alt={application.job.company.companyName}
                     className="h-full w-full object-cover"
                  />
               ) : (
                  <Typography className="text-lg! font-bold!">
                     {application.job.company.companyName.charAt(0).toUpperCase()}
                  </Typography>
               )}
            </Box>

            {/* ================= JOB TITLE ================= */}
            <Box className="min-w-0 flex-[1.2]">
               <Typography className="text-content! truncate! text-[15px]! font-semibold!">
                  {application.job.title}
               </Typography>
            </Box>

            {/* ================= COMPANY ================= */}
            <Box className="min-w-0 flex-1">
               <Typography className="truncate! text-[14px]!" color="textSecondary">
                  {application.job.company.companyName}
               </Typography>
            </Box>

            {/* ================= STATUS ================= */}
            <Box className="flex flex-1 justify-start">
               <ApplicationStatusChip status={application.status as ApplicationStatus} />
            </Box>

            {/* ================= CREATED AT ================= */}
            <Box className="min-w-37.5 flex-1 text-right">
               <Typography className="text-[14px]!" color="textSecondary">
                  {formatCreatedAt(application.createdAt)}
               </Typography>
            </Box>
         </Box>
      </Box>
   )
}

export default RecentApplicationItem
