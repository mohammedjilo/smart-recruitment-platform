import React from "react"
import { CheckCircle, LightbulbOutlined } from "@mui/icons-material"
import { Box, Paper, Typography } from "@mui/material"

const JobTips: React.FC = () => {
   const tips = [
      "Use a clear and specific job title",
      "Describe responsibilities and required skills",
      "Add salary range to attract more candidates",
      "Set a reasonable application deadline"
   ]

   return (
      <Paper
         className="bg-surface! rounded-xl! border! p-4!"
         elevation={0}>
         <Box className="flex items-center gap-2">
            <LightbulbOutlined className="text-[19px]! text-[#475569]!" />

            <Typography className="text-content text-[13px]! font-semibold!">
               Tips for a great job post
            </Typography>
         </Box>

         <Box className="mt-4 space-y-2.5">
            {tips.map(tip => (
               <Box
                  className="flex items-start gap-2"
                  key={tip}>
                  <CheckCircle className="mt-px! text-sm! text-[#22c55e]!" />

                  <Typography className="text-muted text-[10px]! leading-4!">
                     {tip}
                  </Typography>
               </Box>
            ))}
         </Box>
      </Paper>
   )
}

export default JobTips
