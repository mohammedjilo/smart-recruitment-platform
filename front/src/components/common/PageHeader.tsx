import { Box, Typography } from "@mui/material"
import type { ReactNode } from "react"

type PageHeaderProps = {
   title: string
   description: string
   actions?: ReactNode
}

const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
   <Box className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <Box>
         <Typography className="text-2xl! font-bold!">{title}</Typography>
         <Typography
            className="mt-1! text-sm!"
            color="textSecondary">
            {description}
         </Typography>
      </Box>
      {actions}
   </Box>
)

export default PageHeader
