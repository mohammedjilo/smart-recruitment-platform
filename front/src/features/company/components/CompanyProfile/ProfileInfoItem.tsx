import type { ReactNode } from "react"

import { Box, Typography } from "@mui/material"

type ProfileInfoItemProps = {
   icon: ReactNode
   label: string
   value: ReactNode
}

const ProfileInfoItem = ({ icon, label, value }: ProfileInfoItemProps) => {
   return (
      <Box className="flex items-center gap-3">
         <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[#5425d4]">
            {icon}
         </Box>

         <Box className="min-w-0">
            <Typography className="text-xs!">{label}</Typography>

            <Box className="mt-1">
               {typeof value === "string" ? (
                  <Typography
                     className="truncate! text-sm! font-medium!"
                     color="textSecondary">
                     {value}
                  </Typography>
               ) : (
                  value
               )}
            </Box>
         </Box>
      </Box>
   )
}

export default ProfileInfoItem
