import { Box, Tab, Tabs } from "@mui/material"

type JobTabsProps = {
   activeTab: string
   applicationsCount: number

   onChange: (value: string) => void
}

const JobTabs = ({ activeTab, applicationsCount, onChange }: JobTabsProps) => {
   const tabs = [
      {
         label: "Overview",
         value: "overview"
      },
      {
         label: "Application Questions",
         value: "questions"
      },
      {
         label: `Applications (${applicationsCount})`,
         value: "applications"
      }
   ]

   return (
      <Box className="border-b border-border">
         <Tabs
            value={activeTab}
            onChange={(_, value) => onChange(value)}
            variant="scrollable"
            scrollButtons="auto">
            {tabs.map(tab => (
               <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  className="min-h-12! px-5! text-xs! font-medium! normal-case!"
               />
            ))}
         </Tabs>
      </Box>
   )
}

export default JobTabs
