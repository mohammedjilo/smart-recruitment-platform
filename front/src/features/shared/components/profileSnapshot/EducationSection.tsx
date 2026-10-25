import { Box, Typography } from "@mui/material"

import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined"
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined"

import { EmptyText, SectionTitle } from "./ExperienceSection"
import type { ProfileSnapshot } from "@/types/profileSnapshot"

type EducationSectionProps = {
   educations?: ProfileSnapshot["educations"]
}

const EducationSection = ({ educations = [] }: EducationSectionProps) => {
   return (
      <Box className="bg-surface rounded-xl border p-5">
         <SectionTitle
            count={educations?.length ?? 0}
            icon={<SchoolOutlinedIcon />}
            title="Education"
         />

         {(educations?.length ?? 0) === 0 ? (
            <EmptyText text="No education available." />
         ) : (
            <Box className="mt-5 space-y-4">
               {educations.map((education, index) => (
                  <Box
                     className="rounded-lg border p-4"
                     key={`${education.university}-${index}`}>
                     <Typography className="text-sm! font-semibold!">
                        {education.degree}
                     </Typography>

                     <Typography className="mt-1! text-xs! font-medium! text-violet-600">
                        {education.major}
                     </Typography>

                     <Box className="mt-3 flex items-center gap-2">
                        <AccountBalanceOutlinedIcon
                           className="text-muted"
                           fontSize="small"
                        />

                        <Typography
                           className="text-xs!"
                           color="textSecondary">
                           {education.university}
                        </Typography>
                     </Box>
                  </Box>
               ))}
            </Box>
         )}
      </Box>
   )
}

export default EducationSection
