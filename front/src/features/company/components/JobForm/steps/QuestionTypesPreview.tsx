import React from "react"

import { HelpOutlined } from "@mui/icons-material"

import { Box, Paper, Typography } from "@mui/material"
import { questionTypes } from "@/constants/createJob.constants"

const QuestionTypesPreview: React.FC = () => {
   return (
      <Paper
         className="bg-surface! rounded-xl! border! p-4!"
         elevation={0}>
         <Box className="flex items-center gap-2">
            <HelpOutlined className="text-[19px]! text-[#475569]!" />

            <Typography className="text-content! text-sm! font-semibold!">
               Application Questions (Optional)
            </Typography>
         </Box>

         <Typography className="mt-2! text-xs! leading-4!" color="textSecondary">
            Add custom questions to better screen candidates.
         </Typography>

         <Box className="mt-4 space-y-2.5">
            {questionTypes.map(question => {
               const Icon = question.icon

               return (
                  <Box
                     className="flex items-center gap-3"
                     key={question.title}>
                     <Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <Icon fontSize="small" />
                     </Box>

                     <Box>
                        <Typography className="text-sm! font-semibold!">
                           {question.title}
                        </Typography>

                        <Typography
                           className="text-xs!"
                           color="textSecondary">
                           {question.description}
                        </Typography>
                     </Box>
                  </Box>
               )
            })}
         </Box>
      </Paper>
   )
}

export default QuestionTypesPreview
