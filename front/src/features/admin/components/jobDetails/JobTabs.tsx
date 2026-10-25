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
            scrollButtons="auto"
            variant="scrollable"
            onChange={(_, value) => onChange(value)}>
            {tabs.map(tab => (
               <Tab
                  className="min-h-12! px-5! text-xs! font-medium! normal-case!"
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
               />
            ))}
         </Tabs>
      </Box>
   )
}

export default JobTabs
