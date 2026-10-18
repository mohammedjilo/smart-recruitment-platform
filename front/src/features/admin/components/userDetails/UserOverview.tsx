import { Box } from "@mui/material"

import PersonalInformation from "./PersonalInformation"
import UserStatistics from "./UserStatistics"
import type { AdminUserDetails, AdminUserStats } from "@/types/admin"

type Props = {
   user: AdminUserDetails
   stats: AdminUserStats
}

const UserOverview = ({ user, stats }: Props) => {
   return (
      <Box className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.9fr]">
         <PersonalInformation user={user} />

         <UserStatistics stats={stats} />
      </Box>
   )
}

export default UserOverview
