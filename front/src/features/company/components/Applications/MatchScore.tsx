import React from "react"
import { Box, Typography } from "@mui/material"
import { getMatchScoreColor } from "@/theme/tokens"

interface MatchScoreProps {
   score: number | null
}

const MatchScore: React.FC<MatchScoreProps> = ({ score }) => {
   if (score === null) {
      return <span className="text-[10px] text-muted">Not available</span>
   }

   const getMatchLabel = () => {
      if (score >= 85) {
         return {
            label: "Great Match"
         }
      }

      if (score >= 65) {
         return {
            label: "Good Match"
         }
      }

      return {
         label: "Poor Match"
      }
   }

   const match = getMatchLabel()

   return (
      <Box>
         <Typography className="text-[11px]! font-semibold! text-[#172033]!">
            {score}%
         </Typography>

         <Typography
            className="mt-1! text-[9px]! font-medium!"
            sx={{ color: getMatchScoreColor(score) }}>
            {match.label}
         </Typography>
      </Box>
   )
}

export default MatchScore
