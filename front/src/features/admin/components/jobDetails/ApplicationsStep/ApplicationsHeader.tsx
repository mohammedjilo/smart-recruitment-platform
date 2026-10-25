import { Box, Typography } from "@mui/material"

type ApplicationsHeaderProps = {
   totalApplications: number
}

const ApplicationsHeader = ({ totalApplications }: ApplicationsHeaderProps) => {
   return (
      <Box>
         <Typography
            className="font-bold text-content"
            variant="h6">
            All Applications ({totalApplications})
         </Typography>

         <Typography className="mt-1 text-sm text-muted">
            Review and manage all applications for this job.
         </Typography>
      </Box>
   )
}

export default ApplicationsHeader
