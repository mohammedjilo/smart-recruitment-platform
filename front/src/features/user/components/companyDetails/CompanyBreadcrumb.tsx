import { Box, Typography } from "@mui/material"

import ChevronRightIcon from "@mui/icons-material/ChevronRight"

const CompanyBreadcrumb = () => {
   return (
      <Box className="mb-7 flex items-center gap-2">
         <Typography
            className="text-link hover:text-link-hover text-sm font-semibold"
            component="span">
            Companies
         </Typography>

         <ChevronRightIcon className="text-muted text-lg!" />

         <Typography
            className="text-sm font-medium"
            color="textSecondary"
            component="span">
            Company Details
         </Typography>
      </Box>
   )
}

export default CompanyBreadcrumb
