import { Box, Button } from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"

import type { NotificationType } from "@/types/notification"

type NotificationFilter = "ALL" | NotificationType

type Props = {
   filter: NotificationFilter
   onFilterChange: (value: NotificationFilter) => void
   allowedTypes?: NotificationType[]
   onMarkAllAsRead?: () => void
   isMarkingAllAsRead?: boolean
}

const filterOptions: Array<{ value: NotificationFilter; label: string }> = [
   { value: "ALL", label: "All" },
   { value: "APPLICATION", label: "Applications" },
   { value: "MESSAGE", label: "Messages" },
   { value: "INTERVIEW", label: "Interviews" },
   { value: "JOB", label: "Jobs" },
   { value: "SUPPORT", label: "Support" },
   { value: "COMPANY_REQUEST", label: "Company Requests" },
   { value: "SYSTEM", label: "System" }
]

const NotificationsToolbar = ({
   filter,
   onFilterChange,
   allowedTypes,
   onMarkAllAsRead,
   isMarkingAllAsRead = false
}: Props) => {
   const visibleOptions = filterOptions.filter(
      option =>
         option.value === "ALL" || !allowedTypes || allowedTypes.includes(option.value)
   )

   return (
      <Box className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
         <Box className="flex flex-wrap items-center gap-2 rounded-xl border border-[#E3EAF4] bg-[#F8FAFD] p-1">
            {visibleOptions.map(option => (
               <Button
                  className={[
                     "min-h-8! rounded-lg! px-2! text-xs! font-semibold! normal-case!",
                     filter === option.value
                        ? "bg-[#2167E8]! text-white! hover:bg-[#2167E8]!"
                        : "bg-transparent! text-[#526783]! hover:bg-[#EEF3FA]!"
                  ].join(" ")}
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}>
                  {option.label}
               </Button>
            ))}
         </Box>
         {onMarkAllAsRead && (
            <Button
               className="min-h-9! rounded-md! border! border-[#D5DFED]! bg-surface! px-2! text-xs! font-semibold! text-[#2167E8]! normal-case! hover:border-[#BFCDE0]! hover:bg-[#F5F8FC]!"
               disabled={isMarkingAllAsRead}
               startIcon={<CheckIcon className="text-[17px]" />}
               onClick={onMarkAllAsRead}>
               {isMarkingAllAsRead ? "Marking..." : "Mark all as read"}
            </Button>
         )}
      </Box>
   )
}

export default NotificationsToolbar
