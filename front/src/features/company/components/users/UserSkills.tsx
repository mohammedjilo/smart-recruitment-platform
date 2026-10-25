import { Box, Typography } from "@mui/material"

type Props = {
   skills: string[]
}

const UserSkills = ({ skills }: Props) => {
   if (skills.length === 0) {
      return (
         <Typography
            className="text-sm text-muted"
            component="span">
            —
         </Typography>
      )
   }

   const visibleSkills = skills.slice(0, 3)

   const remainingSkills = skills.length - visibleSkills.length

   return (
      <Box className="flex flex-wrap items-center gap-2">
         {visibleSkills.map(skill => (
            <Box
               className="rounded-md bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700"
               key={skill}>
               {skill}
            </Box>
         ))}

         {remainingSkills > 0 && (
            <Box className="flex h-7 min-w-7 items-center justify-center rounded-full border border-border bg-surface px-2">
               <Typography className="text-[11px]! font-semibold! text-muted">
                  +{remainingSkills}
               </Typography>
            </Box>
         )}
      </Box>
   )
}

export default UserSkills
