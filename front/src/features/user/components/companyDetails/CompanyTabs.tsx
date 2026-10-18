import { Box, Tab, Tabs } from "@mui/material"

type Props = {
   activeTab: "about" | "jobs"
   onTabChange: (tab: "about" | "jobs") => void
}

const CompanyTabs = ({ activeTab, onTabChange }: Props) => {
   return (
      <Box className="mb-5 border-b border-border">
         <Tabs
            value={activeTab}
            onChange={(_, value) => onTabChange(value)}
            variant="scrollable"
            scrollButtons="auto">
            <Tab
               value="about"
               label="About"
               className="min-h-12! px-5! text-xs! font-medium! normal-case!"
            />

            <Tab
               value="jobs"
               label="Jobs"
               className="min-h-12! px-5! text-xs! font-medium! normal-case!"
            />
         </Tabs>
      </Box>
   )
}

export default CompanyTabs
