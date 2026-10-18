import { Box, Typography } from "@mui/material"

import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined"

type Props = {
   description: string | null
}

const AboutCompany = ({ description }: Props) => {
   return (
      <Box className="h-full rounded-xl border border-border bg-surface p-6 shadow-sm">
         <Box className="flex items-center gap-4">
            <Box className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
               <BusinessCenterOutlinedIcon className="text-violet-600" />
            </Box>

            <Typography className="text-base! font-bold! text-content">
               About Company
            </Typography>
         </Box>

         <Box className="mt-6">
            <Typography
               className="text-sm! leading-7!"
               color="textSecondary">
               {description || "No company description available."}
            </Typography>
         </Box>
      </Box>
   )
}

export default AboutCompany
