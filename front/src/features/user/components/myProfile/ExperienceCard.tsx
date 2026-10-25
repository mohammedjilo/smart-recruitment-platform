import { Box, Card, CardContent, Divider, Typography } from "@mui/material"

import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined"
import type { Experience } from "@/types/user"
import ProfileCardMenu from "./ProfileCardMenu"
import { formatDate as formatDateValue } from "@/utils/formatDate"

type Props = {
   experiences: Experience[]
}

const formatDate = (date: string | null) =>
   date ? formatDateValue(date, { format: "monthYear" }) : "Present"

const ExperienceCard = ({ experiences }: Props) => {
   return (
      <Card className="rounded-xl! border! shadow-none!">
         <CardContent>
            <Box className="mb-3 flex items-center justify-between">
               <Box className="flex items-center gap-1">
                  <BusinessCenterOutlinedIcon
                     className="text-violet-600"
                     fontSize="small"
                  />

                  <Typography className="text-content text-sm!">Experience</Typography>
               </Box>

               <ProfileCardMenu
                  createLabel="Create Experience"
                  formType="experience"
               />
            </Box>

            {experiences.length === 0 ? (
               <Typography
                  className="text-sm!"
                  color="textSecondary">
                  No experience added yet.
               </Typography>
            ) : (
               <Box>
                  {experiences.map((experience, index) => (
                     <Box key={experience.id}>
                        <Box className="relative pl-3">
                           <Box className="absolute top-2.5 left-0 h-2 w-2 -translate-y-1/2 rounded-full bg-violet-600" />

                           <Box className="flex items-start justify-between gap-2">
                              <Typography className="text-sm!">
                                 {experience.position}
                              </Typography>

                              <ProfileCardMenu
                                 editData={experience}
                                 formType="experience"
                              />
                           </Box>

                           <Typography
                              className="text-xs!"
                              color="textSecondary">
                              {experience.companyName}
                           </Typography>

                           <Typography className="text-sm!">
                              {formatDate(experience.startDate)} -{" "}
                              {formatDate(experience.endDate)}
                           </Typography>

                           {experience.description && (
                              <Typography
                                 className="text-xs! leading-[1.7]!"
                                 color="textSecondary">
                                 {experience.description}
                              </Typography>
                           )}
                        </Box>

                        {index !== experiences.length - 1 && (
                           <Divider className="my-2! ml-3!" />
                        )}
                     </Box>
                  ))}
               </Box>
            )}
         </CardContent>
      </Card>
   )
}

export default ExperienceCard
