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
      <Box className="flex items-start justify-between border-b border-border pb-4">
         <Box>
            <Typography className="text-[15px]! font-semibold! text-content">
               Application Questions
               <span className="ml-1 font-normal text-muted">(Optional)</span>
            </Typography>

            <Typography className="mt-1! text-[10px]! text-muted!">
               Add custom questions that candidates will answer when applying.
            </Typography>
         </Box>

         <Box className="flex items-center gap-5">
            {/* Enable */}
            <Box className="flex items-center gap-2">
               <Typography className="text-[10px]! font-medium! text-muted!">
                  Enable Questions
               </Typography>

               <button
                  type="button"
                  onClick={onToggle}
                  className={[
                     "relative h-5 w-9 rounded-full transition",
                     enabled ? "bg-primary" : "bg-slate-300"
                  ].join(" ")}>
                  <span
                     className={[
                        "absolute top-0.5 h-4 w-4 rounded-full bg-surface shadow-sm transition",
                        enabled ? "left-4.5" : "left-0.5"
                     ].join(" ")}
                  />
               </button>
            </Box>

            <Button
               className="capitalize!"
               variant="outlined"
               size="small"
               startIcon={<Add sx={{ fontSize: 16 }} />}
               onClick={onAdd}
               disabled={!enabled}>
               Add Question
            </Button>
         </Box>
      </Box>
   )
}

export default QuestionsHeader
