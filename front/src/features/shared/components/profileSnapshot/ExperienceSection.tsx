import { Box, Typography } from "@mui/material"

import WorkOutlinedOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import type { ProfileSnapshot } from "@/types/profileSnapshot"
import { formatDate } from "@/utils/profileSnapShot.utils"

type ExperienceSectionProps = {
   experiences?: ProfileSnapshot["experiences"]
}

const ExperienceSection = ({ experiences = [] }: ExperienceSectionProps) => {
   return (
      <Box className="bg-surface rounded-xl border p-5">
         <SectionTitle
            count={experiences?.length ?? 0}
            icon={<WorkOutlinedOutlinedIcon />}
            title="Experience"
         />

         {(experiences?.length ?? 0) === 0 ? (
            <EmptyText text="No experience available." />
         ) : (
            <Box className="mt-6 space-y-6">
               {experiences.map((experience, index) => (
                  <Box
                     className="relative border-l-2 pl-6"
                     key={`${experience.companyName}-${index}`}>
                     <Box className="absolute top-1 -left-1.5 h-2.5 w-2.5 rounded-full bg-violet-600" />

                     <Typography className="text-sm! font-semibold!">
                        {experience.position}
                     </Typography>

                     <Box className="mt-1 flex items-center gap-2">
                        <BusinessOutlinedIcon
                           className="text-violet-600"
                           fontSize="small"
                        />

                        <Typography className="text-xs! font-medium! text-violet-600">
                           {experience.companyName}
                        </Typography>
                     </Box>

                     <Box className="mt-3 flex items-center gap-2">
                        <CalendarMonthOutlinedIcon
                           className="text-muted"
                           fontSize="small"
                        />

                        <Typography
                           className="text-xs!"
                           color="textSecondary">
                           {formatDate(experience.startDate)}
                           {" - "}
                           {formatDate(experience.endDate)}
                        </Typography>
                     </Box>

                     {experience.description && (
                        <Typography className="mt-3! text-xs! leading-6!">
                           {experience.description}
                        </Typography>
                     )}
                  </Box>
               ))}
            </Box>
         )}
      </Box>
   )
}

type SectionTitleProps = {
   icon: React.ReactNode
   title: string
   count?: number
}

export const SectionTitle = ({ icon, title, count }: SectionTitleProps) => {
   return (
      <Box className="flex items-center justify-between gap-3">
         <Box className="flex items-center gap-3">
            <Box className="text-violet-600">{icon}</Box>

            <Typography className="text-sm! font-bold!">{title}</Typography>
         </Box>

         {count !== undefined && (
            <Typography className="text-[10px]! font-semibold! text-violet-600">
               {count} Total
            </Typography>
         )}
      </Box>
   )
}

export const EmptyText = ({ text }: { text: string }) => {
   return (
      <Typography
         className="py-10! text-center! text-sm!"
         color="textSecondary">
         {text}
      </Typography>
   )
}

export default ExperienceSection
