import { Box, Tab, Tabs } from "@mui/material"

type ApplicationTabsProps = {
   activeTab: string

   onChange: (value: string) => void
}

const ApplicationTabs = ({ activeTab, onChange }: ApplicationTabsProps) => {
   return (
      <Box className="border-b">
         <Tabs
            value={activeTab}
            onChange={(_, value) => onChange(value)}>
            <Tab
               value="overview"
               label="Application Overview"
               className="min-h-12 px-5! text-xs! font-medium! normal-case!"
            />

            <Tab
               value="profile"
               label="Profile Snapshot"
               className="min-h-12 px-5! text-xs! font-medium! normal-case!"
            />
         </Tabs>
      </Box>
   )
}

export default ApplicationTabs
