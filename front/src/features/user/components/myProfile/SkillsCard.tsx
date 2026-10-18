import { Box, Card, CardContent, Chip, Typography } from "@mui/material"

import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined"
import type { UserSkill } from "@/types/user"
import ProfileCardMenu from "./ProfileCardMenu"

type Props = {
   skills: UserSkill[]
}

const SkillsCard = ({ skills }: Props) => {
   return (
      <Card className="rounded-xl! border! shadow-none!">
         <CardContent>
            <Box className="mb-2 flex items-center justify-between">
               <Box className="flex items-center gap-1">
                  <PsychologyOutlinedIcon
                     className="text-mui-purple"
                     fontSize="small"
                  />

                  <Typography className="text-sm! text-content">Skills</Typography>
               </Box>

               <ProfileCardMenu
                  createLabel="Create Skill"
                  formType="skill"
               />
            </Box>

            {skills.length === 0 ? (
               <Typography className="text-sm!" color="textSecondary">
                  No skills added yet.
               </Typography>
            ) : (
               <Box className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {skills.map(skill => (
                     <Box
                        key={skill.id}
                        className="flex w-full min-w-0 items-center justify-between rounded-lg border border-border px-2 py-1">
                        <Chip
                           label={skill.skillName}
                           size="small"
                           variant="outlined"
                           className="min-w-0!"
                        />

                        <ProfileCardMenu
                           formType="skill"
                           editData={{
                              id: skill.id,
                              skillName: skill.skillName,
                              originalSkill: skill.skillName,
                              allSkills: skills.map(item => item.skillName)
                           }}
                        />
                     </Box>
                  ))}
               </Box>
            )}
         </CardContent>
      </Card>
   )
}

export default SkillsCard
