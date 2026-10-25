import { Box, Tab, Tabs } from "@mui/material"
import { useState } from "react"

import type { AdminUserDetails, AdminUserStats } from "@/types/admin"
import UserOverview from "./UserOverview"
import ProfessionalProfile from "./ProfessionalProfile"

type Props = {
   user: AdminUserDetails
   stats: AdminUserStats
}

const UserDetailsTabs = ({ user, stats }: Props) => {
   const [activeTab, setActiveTab] = useState(0)
   const tabs = ["Overview", "Professional Profile"]

   return (
      <Box>
         <Box className="border-b border-border">
            <Tabs
               value={activeTab}
               scrollButtons="auto"
               variant="scrollable"
               onChange={(_, value) => setActiveTab(value)}>
               {tabs.map(label => (
                  <Tab
                     className="min-h-12! px-5! text-xs! font-medium! normal-case!"
                     key={label}
                     label={label}
                  />
               ))}
            </Tabs>
         </Box>

         <Box className="pt-6">
            {activeTab === 0 && (
               <UserOverview
                  stats={stats}
                  user={user}
               />
            )}

            {activeTab === 1 && (
               <ProfessionalProfile
                  key={user.id}
                  userId={user.id}
               />
            )}
         </Box>
      </Box>
   )
}

export default UserDetailsTabs
