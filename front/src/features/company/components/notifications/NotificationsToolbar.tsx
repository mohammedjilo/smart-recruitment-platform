import { Box, Button } from "@mui/material"

import CheckIcon from "@mui/icons-material/Check"

import type { NotificationType } from "@/types/notification"

type NotificationFilter = "ALL" | NotificationType

const filterOptions: Array<{ value: NotificationFilter; label: string }> = [
   { value: "ALL", label: "All" },
   { value: "APPLICATION", label: "Applications" },
   { value: "MESSAGE", label: "Messages" },
   { value: "INTERVIEW", label: "Interviews" },
   { value: "JOB", label: "Jobs" },
   { value: "SYSTEM", label: "System" }
]

type Props = {
   filter: NotificationFilter
   onFilterChange: (value: NotificationFilter) => void
}

const NotificationsToolbar = ({ filter, onFilterChange }: Props) => {
   return (
      <Box className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
         {/* Filters */}
         <Box className="bg-mui-blue-50 flex flex-wrap items-center gap-2 rounded-xl border border-[#E3EAF4] p-1">
            {filterOptions.map(option => (
               <Button
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  className={[
                     "min-h-8! rounded-lg! px-2! text-xs! font-semibold! normal-case!",
                     filter === option.value
                        ? "bg-[#2167E8]! text-white! hover:bg-[#2167E8]!"
                        : "bg-transparent! text-[#526783]! hover:bg-[#EEF3FA]!"
                  ].join(" ")}>
                  {option.label}
               </Button>
            ))}
         </Box>

         {/* Mark all as read */}
         <Button
            startIcon={<CheckIcon className="text-[17px]" />}
            className="px-1.7! min-h-9! rounded-md! border! border-[#D5DFED]! bg-surface! py-0! text-xs! font-semibold! text-[#2167E8]! normal-case! hover:border-[#BFCDE0]! hover:bg-[#F5F8FC]!">
            Mark all as read
         </Button>
      </Box>
   )
}

export default NotificationsToolbar
