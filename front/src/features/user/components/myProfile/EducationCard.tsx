import { Box, Card, CardContent, Chip, Typography } from "@mui/material"

import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined"
import type { Education } from "@/types/user"
import ProfileCardMenu from "./ProfileCardMenu"

type Props = {
   educations: Education[]
}

const formatYear = (date: string | null) => {
   if (!date) return "Present"

   return new Date(date).getFullYear()
}

const EducationCard = ({ educations }: Props) => {
   return (
      <Card className="rounded-xl! border! shadow-none!">
         <CardContent>
            <Box className="mb-2.5 flex items-center justify-between">
               <Box className="flex items-center gap-1">
                  <SchoolOutlinedIcon
                     className="text-mui-purple"
                     fontSize="small"
                  />

                  <Typography className="text-sm! text-content">Education</Typography>
               </Box>

               <ProfileCardMenu
                  createLabel="Create Education"
                  formType="education"
               />
            </Box>

            {educations.length === 0 ? (
               <Typography className="text-sm!">No education added yet.</Typography>
            ) : (
               <Box className="flex flex-col gap-3">
                  {educations.map((education, index) => (
                     <Box
                        key={education.id}
                        className="relative pb-1 pl-3 last:pb-0">
                        <Box className="absolute top-1 left-px h-2 w-2 rounded-full bg-violet-600" />

                        {index !== educations.length - 1 && (
                           <Box className="absolute top-3.5 -bottom-4.5 left-2 w-px bg-slate-200" />
                        )}

                        <Box className="flex flex-wrap justify-between gap-2">
                           <Box className="w-full min-w-0">
                              <Box className="flex w-full justify-between">
                                 <Typography className="text-sm!">
                                    {education.degree}
                                 </Typography>

                                 <ProfileCardMenu
                                    formType="education"
                                    editData={education}
                                 />
                              </Box>

                              <Typography
                                 className="text-xs!"
                                 color="textSecondary">
                                 {education.major} آ· {education.university}
                              </Typography>
                              <Chip
                                 className="mt-2!"
                                 label={`${formatYear(education.startDate)} - ${formatYear(
                                    education.endDate
                                 )}`}
                                 size="small"
                                 variant="outlined"
                              />
                           </Box>
                        </Box>
                     </Box>
                  ))}
               </Box>
            )}
         </CardContent>
      </Card>
   )
}

export default EducationCard
