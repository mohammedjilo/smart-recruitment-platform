import { Box, Typography } from "@mui/material"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import { getMatchScoreColor } from "@/theme/tokens"
import { MatchScore } from "../ApplicationItem"

const ApplicationMatchScore = ({ score }: { score: number }) => (
   <Box className="p-5">
      <Box className="mb-3 flex items-center gap-2">
         <TrendingUpIcon
            sx={{ color: getMatchScoreColor(score) }}
            fontSize="small"
         />
         <Typography className="text-sm font-semibold text-[#17213B]!">
            Match Score
         </Typography>
      </Box>
      <Box className="flex items-center gap-4">
         <MatchScore score={score} size={70} />
         <Box>
            <Typography
               className="font-semibold!"
               sx={{ color: getMatchScoreColor(score) }}>
               {score >= 85
                  ? "Excellent Match"
                  : score >= 70
                    ? "Strong Match"
                    : score >= 50
                      ? "Good Match"
                      : "Low Match"}
            </Typography>
            <Typography className="mt-1! text-xs! leading-5! text-[#64748B]!">
               Your match score is based on your profile, skills, experience and the job
               requirements.
            </Typography>
         </Box>
      </Box>
   </Box>
)

export default ApplicationMatchScore
