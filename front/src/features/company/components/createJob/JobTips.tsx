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
         elevation={0}
         className="rounded-xl! border! bg-surface! p-4!">
         <Box className="flex items-center gap-2">
            <LightbulbOutlined
               sx={{
                  fontSize: 19,
                  color: "#475569"
               }}
            />

            <Typography className="text-[13px]! font-semibold! text-content">
               Tips for a great job post
            </Typography>
         </Box>

         <Box className="mt-4 space-y-2.5">
            {tips.map(tip => (
               <Box
                  key={tip}
                  className="flex items-start gap-2">
                  <CheckCircle
                     sx={{
                        fontSize: 14,
                        color: "#22c55e",
                        marginTop: "1px"
                     }}
                  />

                  <Typography className="text-[10px]! leading-4! text-muted">
                     {tip}
                  </Typography>
               </Box>
            ))}
         </Box>
      </Paper>
   )
}

export default JobTips
