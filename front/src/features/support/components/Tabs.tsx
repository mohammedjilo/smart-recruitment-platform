import { Box } from "@mui/material"

type Props = {
   activeTab: number
   onChange: (index: number) => void
}

const tabs = ["Help Center", "My Support Requests"]

export default function Tabs({ activeTab, onChange }: Props) {
   return (
      <Box className="mt-7 border-b border-border">
         <Box className="flex gap-8">
            {tabs.map((tab, index) => (
               <button
                  key={tab}
                  onClick={() => onChange(index)}
                  className={`relative pb-3 text-[13px] font-medium transition-colors ${
                     activeTab === index
                        ? "text-blue-600"
                        : "text-muted hover:text-content"
                  } `}>
                  {tab}

                  {activeTab === index && (
                     <Box className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-blue-600" />
                  )}
               </button>
            ))}
         </Box>
      </Box>
   )
}
