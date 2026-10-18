import { Box, Typography } from "@mui/material"
import type { ReactNode } from "react"

type PageHeaderProps = {
   title: ReactNode
   description?: ReactNode
   action?: ReactNode
   titleAdornment?: ReactNode
}

const PageHeader = ({
   title,
   description,
   action,
   titleAdornment
}: PageHeaderProps) => {
   return (
      <Box className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
         <Box className="min-w-0">
            <Box className="flex items-center gap-3">
               {titleAdornment}
               <Typography
                  component="h1"
                  className="text-content text-[26px]! leading-[1.2]! font-bold! tracking-[-0.02em]!">
                  {title}
               </Typography>
            </Box>
            {description && (
               <Typography
                  component="p"
                  className="mt-1.5! text-sm!"
                  color="textSecondary">
                  {description}
               </Typography>
            )}
         </Box>
         {action}
      </Box>
   )
}

export default PageHeader
