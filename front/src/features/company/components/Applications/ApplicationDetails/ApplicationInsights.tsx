import { Box, Chip, Divider, Typography } from "@mui/material"
import { AutoAwesome, CheckCircleOutlined, Tune } from "@mui/icons-material"

type Props = {
   recommendation: string | null
   strengths: string[]
   missingSkills: string[]
}

const ApplicationInsights = ({ recommendation, strengths, missingSkills }: Props) => (
   <Box className="contents">
      <Divider />
      {recommendation && (
         <Box className="p-5">
            <Box className="rounded-lg border border-[#E8E2FF] bg-[#FCFAFF] p-4">
               <Box className="mb-2 flex items-center gap-2">
                  <AutoAwesome className="text-[#6741E8]!" fontSize="small" />
                  <Typography className="text-sm! font-semibold! text-[#17213B]!">
                     AI Recommendation
                  </Typography>
               </Box>
               <Typography className="text-xs! leading-5! text-[#64748B]!">
                  {recommendation}
               </Typography>
            </Box>
         </Box>
      )}
      {strengths.length > 0 && (
         <Box className="px-5 pb-5">
            <Box className="mb-3 flex items-center gap-2">
               <CheckCircleOutlined className="text-[#10B981]!" fontSize="small" />
               <Typography className="text-sm! font-semibold! text-[#17213B]!">
                  Top Strengths
               </Typography>
            </Box>
            <Box className="flex flex-wrap gap-2">
               {strengths.map((strength, index) => (
                  <Chip
                     className="bg-[#ECFDF5]! text-[#059669]!"
                     key={`${strength}-${index}`}
                     icon={<CheckCircleOutlined fontSize="small" />}
                     label={strength}
                     size="small"
                     sx={{ "& .MuiChip-icon": { color: "#10B981" } }}
                  />
               ))}
            </Box>
         </Box>
      )}
      {missingSkills.length > 0 && (
         <Box className="border-t border-[#E7EAF0] px-5 py-5">
            <Box className="mb-3 flex items-center gap-2">
               <Tune className="text-[#F59E0B]!" fontSize="small" />
               <Typography className="text-sm! font-semibold! text-[#17213B]!">
                  Missing Skills
               </Typography>
            </Box>
            <Box className="flex flex-wrap gap-2">
               {missingSkills.map((skill, index) => (
                  <Chip
                     className="bg-[#FFF8E7]! text-[#D97706]!"
                     key={`${skill}-${index}`}
                     label={skill}
                     size="small"
                  />
               ))}
            </Box>
         </Box>
      )}
   </Box>
)

export default ApplicationInsights
