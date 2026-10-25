import { Box, Typography } from "@mui/material"
import type { JobSkill } from "@/types/company"

type JobDescriptionProps = {
   description: string
   skills: JobSkill[]
}

const JobDescription = ({ description, skills }: JobDescriptionProps) => {
   return (
      <section className="rounded-xl border bg-surface p-5">
         <Typography className="text-base! font-semibold! text-content">
            Job Description
         </Typography>

         <Typography className="mt-4! text-sm! leading-7! whitespace-pre-line! text-muted">
            {description}
         </Typography>

         <Box className="mt-7">
            <Typography className="text-sm! font-semibold!">Skills</Typography>

            {skills.length > 0 ? (
               <Box className="mt-3 flex flex-wrap gap-2">
                  {skills.map(({ id, skill }) => (
                     <Typography
                        className="rounded-md! border! border-border! bg-bg! px-3! py-1.5! text-xs! font-medium! text-muted"
                        key={id}>
                        {skill.skillName}
                     </Typography>
                  ))}
               </Box>
            ) : (
               <Typography className="mt-3! text-sm! text-muted">
                  No skills added.
               </Typography>
            )}
         </Box>
      </section>
   )
}

export default JobDescription
