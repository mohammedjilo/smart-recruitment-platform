import { Box, Chip, Typography } from "@mui/material"

import SellOutlinedIcon from "@mui/icons-material/SellOutlined"

type JobSkillsProps = {
   skills: {
      skill: {
         skillName: string
      }
   }[]
}

const JobSkills = ({ skills }: JobSkillsProps) => {
   return (
      <Box className="rounded-xl border bg-surface p-6">
         <Box className="flex items-center gap-3">
            <SellOutlinedIcon
               className="text-primary"
               fontSize="small"
            />

            <Typography className="text-sm! font-bold! text-content">Skills</Typography>
         </Box>

         {skills.length > 0 ? (
            <Box className="mt-5 flex flex-wrap gap-2">
               {skills.map(({ skill }) => (
                  <Chip
                     key={skill.skillName}
                     label={skill.skillName}
                     size="small"
                     className="border-primary/20 bg-primary/5 text-primary rounded-md border text-xs font-semibold"
                  />
               ))}
            </Box>
         ) : (
            <Typography className="mt-5! text-sm! text-muted">
               No skills specified.
            </Typography>
         )}
      </Box>
   )
}

export default JobSkills
