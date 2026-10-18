import { Box, Typography } from "@mui/material"

const JobDetailsHeader = () => {
   return (
      <Box className="mb-5">
         <Typography className="font-bold! text-content">Job Details</Typography>

         <Typography className="mt-1! text-xs! text-muted">
            View job posting information
         </Typography>
      </Box>
   )
}

export default JobDetailsHeader
