import { Box, Typography } from "@mui/material"
import { TrendingUp } from "@mui/icons-material"
import { getMatchScoreColor } from "@/theme/tokens"
import MatchScore from "../MatchScore"

const ApplicationMatchScore = ({ score }: { score: number }) => (
   <Box className="p-5">
      <Box className="mb-3 flex items-center gap-2">
         <TrendingUp fontSize="small" sx={{ color: getMatchScoreColor(score) }} />
         <Typography className="text-sm font-semibold text-[#17213B]!">
            Match Score
         </Typography>
      </Box>
      <Box className="flex items-center gap-4">
         <MatchScore score={score} />
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
               Candidate match score is based on profile, skills, experience, and job
               requirements.
            </Typography>
         </Box>
      </Box>
   </Box>
)

export default ApplicationMatchScore
