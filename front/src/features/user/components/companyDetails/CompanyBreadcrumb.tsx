import { Box, Typography } from "@mui/material"

import ChevronRightIcon from "@mui/icons-material/ChevronRight"

const CompanyBreadcrumb = () => {
   return (
      <Box className="mb-7 flex items-center gap-2">
         <Typography
            component="span"
            className="text-sm font-semibold text-link hover:text-link-hover">
            Companies
         </Typography>

         <ChevronRightIcon
            className="text-muted"
            sx={{ fontSize: 18 }}
         />

         <Typography
            component="span"
            className="text-sm font-medium" color="textSecondary">
            Company Details
         </Typography>
      </Box>
   )
}

export default CompanyBreadcrumb
