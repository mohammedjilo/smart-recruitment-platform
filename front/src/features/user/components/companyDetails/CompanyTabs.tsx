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
            scrollButtons="auto"
            variant="scrollable"
            onChange={(_, value) => onTabChange(value)}>
            <Tab
               className="min-h-12! px-5! text-xs! font-medium! normal-case!"
               value="about"
               label="About"
            />

            <Tab
               className="min-h-12! px-5! text-xs! font-medium! normal-case!"
               value="jobs"
               label="Jobs"
            />
         </Tabs>
      </Box>
   )
}

export default CompanyTabs
