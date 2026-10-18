import { Box, Card, CardContent, Typography } from "@mui/material"

import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import type { ProfessionalProfile } from "@/types/user"
import ProfileCardMenu from "./ProfileCardMenu"

type Props = {
   professionalProfile: ProfessionalProfile | null
}

const ProfessionalProfileCard = ({ professionalProfile }: Props) => {
   return (
      <Card className="rounded-xl! border! shadow-none!">
         <CardContent>
            <Box className="mb-2.5 flex items-center justify-between">
               <Box className="flex items-center gap-1">
                  <WorkOutlineOutlinedIcon
                     className="text-mui-purple"
                     fontSize="small"
                  />

                  <Typography className="text-sm! text-content">
                     Professional Profile
                  </Typography>
               </Box>

               <ProfileCardMenu
                  createLabel="Create Professional Profile"
                  formType="professionalProfile"
               />
            </Box>

            {!professionalProfile ? (
               <Typography className="text-sm!" color="textSecondary">
                  No professional profile information added yet.
               </Typography>
            ) : (
               <Box className="flex flex-col gap-2">
                  <InfoRow
                     label="Job Title"
                     value={professionalProfile.jobTitle}
                  />

                  <InfoRow
                     label="Summary"
                     value={professionalProfile.summary}
                     multiline
                  />

                  <InfoRow
                     label="Years of Experience"
                     value={
                        professionalProfile.yearsOfExperience !== null
                           ? `${professionalProfile.yearsOfExperience} years`
                           : null
                     }
                  />

                  <Box className="grid items-center gap-2 sm:grid-cols-[220px_1fr]">
                     <Typography>Resume / CV</Typography>

                     {professionalProfile.cvPath ? (
                        <Box className="flex items-center gap-1.5 rounded-md border px-1.5 py-1">
                           <DescriptionOutlinedIcon
                              fontSize="small"
                              color="primary"
                           />

                           <Typography
                              className="text-xs!"
                              noWrap>
                              CV uploaded
                           </Typography>
                        </Box>
                     ) : (
                        <Typography className="text-xs!" color="textSecondary">
                           No CV uploaded
                        </Typography>
                     )}
                  </Box>
               </Box>
            )}
         </CardContent>
      </Card>
   )
}

type InfoRowProps = {
   label: string
   value: string | null
   multiline?: boolean
}

const InfoRow = ({ label, value, multiline = false }: InfoRowProps) => {
   return (
      <Box className="grid gap-2 sm:grid-cols-[220px_1fr]">
         <Typography color="text-sm!">{label}</Typography>

         <Typography
            className={`text-xs! ${
               value ? "text-content" : "text-muted"
            } ${multiline ? "leading-[1.7]!" : ""}`}>
            {value || "-"}
         </Typography>
      </Box>
   )
}

export default ProfessionalProfileCard
