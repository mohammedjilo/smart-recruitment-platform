import { Box, Chip } from "@mui/material"

import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined"

import { EmptyText, SectionTitle } from "./ExperienceSection"

type SkillsSectionProps = {
   skills?: string[]
}

const SkillsSection = ({ skills = [] }: SkillsSectionProps) => {
   return (
      <Box className="rounded-xl border bg-surface p-5">
         <SectionTitle
            count={skills?.length ?? 0}
            icon={<AutoAwesomeOutlinedIcon />}
            title="Skills"
         />

         {(skills?.length ?? 0) === 0 ? (
            <EmptyText text="No skills available." />
         ) : (
            <Box className="mt-5 flex flex-wrap gap-2">
               {skills.map((skill, index) => (
                  <Chip
                     className="rounded-md! border-violet-100! bg-violet-50! text-xs! font-medium! text-violet-700!"
                     key={`${skill}-${index}`}
                     label={skill}
                     size="small"
                  />
               ))}
            </Box>
         )}
      </Box>
   )
}

export default SkillsSection
