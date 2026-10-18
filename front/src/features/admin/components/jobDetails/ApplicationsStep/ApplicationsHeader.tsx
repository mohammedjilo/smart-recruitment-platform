import { Box, Typography } from "@mui/material"

type ApplicationsHeaderProps = {
   totalApplications: number
}

const ApplicationsHeader = ({ totalApplications }: ApplicationsHeaderProps) => {
   return (
      <Box>
         <Typography
            variant="h6"
            className="font-bold text-content">
            All Applications ({totalApplications})
         </Typography>

         <Typography className="mt-1 text-sm text-muted">
            Review and manage all applications for this job.
         </Typography>
      </Box>
   )
}

export default ApplicationsHeader
