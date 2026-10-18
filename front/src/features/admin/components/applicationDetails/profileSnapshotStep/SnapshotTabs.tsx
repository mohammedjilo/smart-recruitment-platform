import { Box, Tab, Tabs } from "@mui/material"

export type SnapshotTab =
   | "overview"
   | "experience"
   | "education"
   | "projects"
   | "skills"
   | "certificates"
   | "languages"

type SnapshotTabsProps = {
   activeTab: SnapshotTab
   onChange: (tab: SnapshotTab) => void
}

const tabs: {
   value: SnapshotTab
   label: string
}[] = [
   {
      value: "overview",
      label: "Overview"
   },
   {
      value: "experience",
      label: "Experience"
   },
   {
      value: "education",
      label: "Education"
   },
   {
      value: "projects",
      label: "Projects"
   },
   {
      value: "skills",
      label: "Skills"
   },
   {
      value: "certificates",
      label: "Certificates"
   },
   {
      value: "languages",
      label: "Languages"
   }
]

const SnapshotTabs = ({ activeTab, onChange }: SnapshotTabsProps) => {
   return (
      <Box
         className="responsive-scroll-region overflow-x-auto border-b border-border"
         role="region"
         aria-label="Profile snapshot sections; scroll horizontally to see all tabs"
         tabIndex={0}>
         <Tabs
            value={activeTab}
            onChange={(_, value) => onChange(value)}
            variant="scrollable"
            scrollButtons={false}>
            {tabs.map(tab => (
               <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  className="min-h-12! min-w-22! text-[10px]! font-medium! normal-case!"
               />
            ))}
         </Tabs>
      </Box>
   )
}

export default SnapshotTabs
