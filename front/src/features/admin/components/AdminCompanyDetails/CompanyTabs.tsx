import { Box, Tab, Tabs } from "@mui/material"

type Props = {
   activeTab: "overview" | "jobs" | "applications"
   totalJobs: number
   totalApplications: number
   showApplications: boolean
   onChange: (value: "overview" | "jobs" | "applications") => void
}

const CompanyTabs = ({
   activeTab,
   totalJobs,
   totalApplications,
   showApplications,
   onChange
}: Props) => {
   return (
      <Box className="border-border my-3 border-b">
         <Tabs
            className="min-h-10.5!"
            value={activeTab}
            sx={{
               "& .MuiTab-root": {
                  minHeight: 42,
                  minWidth: 95,
                  padding: "8px 16px",
                  textTransform: "none",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#64748B"
               },
               "& .Mui-selected": {
                  color: "#5425D4 !important",
                  fontWeight: 700
               },
               "& .MuiTabs-indicator": {
                  backgroundColor: "#6D28D9"
               }
            }}
            onChange={(_, value) => onChange(value)}>
            <Tab
               value="overview"
               label="Overview"
            />

            <Tab
               value="jobs"
               label={`Jobs (${totalJobs})`}
            />

            {showApplications && (
               <Tab
                  value="applications"
                  label={`Applications (${totalApplications})`}
               />
            )}
         </Tabs>
      </Box>
   )
}

export default CompanyTabs
