import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined"

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined"

import { Box, Typography } from "@mui/material"

import CompanyStatCard from "./CompanyStatCard"

type Props = {
   stats: {
      totalJobs: number
      totalApplications: number
   }
}

const CompanyStatistics = ({ stats }: Props) => {
   return (
      <Box>
         <Typography className="text-content text-[16px] font-semibold">
            Company Statistics
         </Typography>

         <Box className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CompanyStatCard
               title="Total Jobs"
               value={stats.totalJobs}
               subtitle="Jobs posted by this company"
               iconClassName="
                  bg-violet-100 text-violet-600
               "
               icon={<BusinessCenterOutlinedIcon />}
            />

            <CompanyStatCard
               title="Total Applications"
               value={stats.totalApplications}
               subtitle="Applications received"
               iconClassName="
                  bg-blue-100 text-blue-600
               "
               icon={<GroupsOutlinedIcon />}
            />
         </Box>
      </Box>
   )
}

export default CompanyStatistics
