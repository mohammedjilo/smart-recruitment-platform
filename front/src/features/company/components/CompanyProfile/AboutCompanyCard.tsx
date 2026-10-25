import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined"
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined"
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined"
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined"

import { Box, Typography } from "@mui/material"
import type { Company } from "@/types/company"
import CompanyStatusChip from "@/components/common/CompanyStatusChip"
import formatCreatedAt from "@/utils/formatDate"

type AboutCompanyCardProps = {
   company: Company
   totalJobsPosted: number
   totalApplicationsReceived: number
}

type DetailRowProps = {
   icon: React.ReactNode
   label: string
   value: React.ReactNode
   showBorder?: boolean
}

const DetailRow = ({ icon, label, value, showBorder = false }: DetailRowProps) => {
   return (
      <Box
         className={`flex items-center justify-between gap-4 py-3 ${showBorder ? "border-border border-t" : ""} `}>
         <Box className="flex min-w-0 items-center gap-3">
            <Box className="text-[#5425d4]">{icon}</Box>

            <Typography className="text-sm!">{label}</Typography>
         </Box>

         <Box className="min-w-0">
            {typeof value === "string" || typeof value === "number" ? (
               <Typography
                  className="text-right! text-sm! font-medium! break-all!"
                  color="textSecondary">
                  {value}
               </Typography>
            ) : (
               value
            )}
         </Box>
      </Box>
   )
}

const AboutCompanyCard = ({
   company,
   totalJobsPosted,
   totalApplicationsReceived
}: AboutCompanyCardProps) => {
   return (
      <Box className="bg-surface rounded-xl border p-6">
         <Box className="flex items-center gap-3">
            <ArticleOutlinedIcon className="text-muted text-xl!" />

            <Typography className="text-content text-lg! font-semibold!">
               About Company
            </Typography>
         </Box>

         <Box className="mt-6">
            <Typography className="font-semibold!">Description</Typography>

            <Typography
               className="mt-2! text-sm! leading-7! whitespace-pre-line!"
               color="textSecondary">
               {company.description || "No company description has been added yet."}
            </Typography>
         </Box>

         <Box className="mt-4">
            <DetailRow
               value={company.id}
               icon={<BadgeOutlinedIcon className="text-lg!" />}
               label="Company ID"
               showBorder
            />

            <DetailRow
               value={formatCreatedAt(company.createdAt)}
               icon={<CalendarMonthOutlinedIcon className="text-lg!" />}
               label="Member Since"
            />

            <DetailRow
               value={formatCreatedAt(company.updatedAt)}
               icon={<HistoryOutlinedIcon className="text-lg!" />}
               label="Last Updated"
            />

            <DetailRow
               value={<CompanyStatusChip status={company.status} />}
               icon={<SecurityOutlinedIcon className="text-lg!" />}
               label="Account Status"
            />

            <DetailRow
               value={totalJobsPosted}
               icon={<WorkOutlineOutlinedIcon className="text-lg!" />}
               label="Total Jobs Posted"
            />

            <DetailRow
               value={totalApplicationsReceived}
               icon={<GroupsOutlinedIcon className="text-lg!" />}
               label="Total Applications Received"
            />
         </Box>
      </Box>
   )
}

export default AboutCompanyCard
