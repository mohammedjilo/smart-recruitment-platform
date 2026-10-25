import { Box, Typography } from "@mui/material"

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"

type Props = {
   title: string
   description: string
   icon?: React.ReactNode
   children: React.ReactNode
}

const AboutSection = ({ title, description, icon, children }: Props) => {
   return (
      <Box className="border-border bg-surface rounded-xl border p-5 shadow-sm md:p-6">
         {/* Section Header */}
         <Box className="mb-6 flex items-start gap-4">
            <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
               {icon || <InfoOutlinedIcon className="text-2xl!" />}
            </Box>

            <Box>
               <Typography className="text-content text-lg font-bold">{title}</Typography>

               <Typography
                  className="mt-1 text-xs leading-5"
                  color="textSecondary">
                  {description}
               </Typography>
            </Box>
         </Box>

         {children}
      </Box>
   )
}

export default AboutSection
