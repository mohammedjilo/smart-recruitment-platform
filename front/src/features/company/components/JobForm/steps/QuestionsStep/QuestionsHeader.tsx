import React from "react"

import { Add } from "@mui/icons-material"

import { Box, Button, Typography } from "@mui/material"

interface QuestionsHeaderProps {
   enabled: boolean
   onToggle: () => void
   onAdd: () => void
}

const QuestionsHeader: React.FC<QuestionsHeaderProps> = ({
   enabled,
   onToggle,
   onAdd
}) => {
   return (
      <Box className="border-border flex items-start justify-between border-b pb-4">
         <Box>
            <Typography className="text-[15px]! font-semibold!">
               Application Questions
               <span className="text-muted ml-1 font-normal">(Optional)</span>
            </Typography>

            <Typography
               className="mt-1! text-[10px]!"
               color="textSecondary">
               Add custom questions that candidates will answer when applying.
            </Typography>
         </Box>

         <Box className="flex items-center gap-5">
            {/* Enable */}
            <Box className="flex items-center gap-2">
               <Typography
                  className="text-[10px]! font-medium!"
                  color="textSecondary">
                  Enable Questions
               </Typography>

               <button
                  className={[
                     "relative h-5 w-9 rounded-full transition",
                     enabled ? "bg-primary" : "bg-slate-300"
                  ].join(" ")}
                  type="button"
                  onClick={onToggle}>
                  <span
                     className={[
                        "bg-surface absolute top-0.5 h-4 w-4 rounded-full shadow-sm transition",
                        enabled ? "left-4.5" : "left-0.5"
                     ].join(" ")}
                  />
               </button>
            </Box>

            <Button
               className="capitalize!"
               disabled={!enabled}
               size="small"
               startIcon={<Add className="text-base!" />}
               variant="outlined"
               onClick={onAdd}>
               Add Question
            </Button>
         </Box>
      </Box>
   )
}

export default QuestionsHeader
