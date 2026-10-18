import { Box, Typography } from "@mui/material"

import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined"
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined"

import { EmptyText, SectionTitle } from "./ExperienceSection"
import type { ProfileSnapshot } from "@/types/admin"

type EducationSectionProps = {
   educations?: ProfileSnapshot["educations"]
}

const EducationSection = ({ educations = [] }: EducationSectionProps) => {
   return (
      <Box className="rounded-xl border bg-surface p-5">
         <SectionTitle
            icon={<SchoolOutlinedIcon />}
            title="Education"
            count={educations?.length ?? 0}
         />

         {(educations?.length ?? 0) === 0 ? (
            <EmptyText text="No education available." />
         ) : (
            <Box className="mt-5 space-y-4">
               {educations.map((education, index) => (
                  <Box
                     key={`${education.university}-${index}`}
                     className="rounded-lg border p-4">
                     <Typography className="text-sm! font-semibold!">
                        {education.degree}
                     </Typography>

                     <Typography className="mt-1 text-xs font-medium text-violet-600">
                        {education.major}
                     </Typography>

                     <Box className="mt-3 flex items-center gap-2">
                        <AccountBalanceOutlinedIcon
                           fontSize="small"
                           className="text-muted"
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
