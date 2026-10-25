import { Box, Typography } from "@mui/material"
import { Link } from "react-router-dom"

interface SectionHeaderProps {
   title: string
   href?: string
}

const SectionHeader = ({ title, href }: SectionHeaderProps) => {
   return (
      <Box className="flex items-center justify-between px-5 pt-4">
         <Typography
            className="text-[16px]! font-semibold!"
            variant="h2">
            {title}
         </Typography>

         {href && (
            <Link
               className="text-link hover:text-link-hover text-[13px] font-medium transition"
               to={href}>
               View all
            </Link>
         )}
      </Box>
   )
}
export default SectionHeader
