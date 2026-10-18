import { Box, Typography } from "@mui/material"
import type { ReactNode } from "react"

type Props = {
   title: string
   description: string
   icon: ReactNode
   iconClass: string
}

const StatusCard = ({ title, description, icon, iconClass }: Props) => {
   return (
      <Box className="flex min-h-26 items-center gap-4 rounded-lg border border-border bg-surface p-4 transition hover:border-violet-200 hover:shadow-sm">
         {/* Icon */}
         <Box
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass} `}>
            {icon}
         </Box>

         {/* Content */}
         <Box className="min-w-0">
            <Typography className="text-sm! font-bold! text-content">
               {title}
            </Typography>

            <Typography className="mt-1! max-w-130! text-xs! leading-5!" color="textSecondary">
               {description}
            </Typography>
         </Box>
      </Box>
   )
}

export default StatusCard
