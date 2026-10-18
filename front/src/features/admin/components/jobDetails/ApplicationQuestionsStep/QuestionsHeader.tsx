import { Box, Typography } from "@mui/material"

const QuestionsHeader = () => {
   return (
      <Box>
         <Typography className="font-bold! text-content">
            Application Questions
         </Typography>

         <Typography className="mt-1! text-sm! text-muted">
            These questions will be asked to candidates when they apply for this job.
         </Typography>
      </Box>
   )
}

export default QuestionsHeader
