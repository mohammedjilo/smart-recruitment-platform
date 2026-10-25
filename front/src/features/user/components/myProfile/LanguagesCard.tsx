import { Box, Card, CardContent, Chip, Typography } from "@mui/material"

import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined"
import type { UserLanguage } from "@/types/user"
import ProfileCardMenu from "./ProfileCardMenu"

type Props = {
   languages: UserLanguage[]
}

const formatLevel = (level: string) => {
   return level.charAt(0) + level.slice(1).toLowerCase()
}

const LanguagesCard = ({ languages }: Props) => {
   return (
      <Card className="rounded-xl! border! shadow-none!">
         <CardContent>
            <Box className="mb-2 flex items-center justify-between">
               <Box className="flex items-center gap-1">
                  <LanguageOutlinedIcon
                     className="text-violet-600"
                     fontSize="small"
                  />

                  <Typography className="text-content text-sm!">Languages</Typography>
               </Box>

               <ProfileCardMenu
                  createLabel="Create Language"
                  formType="language"
               />
            </Box>

            {languages.length === 0 ? (
               <Typography
                  className="text-sm!"
                  color="textSecondary">
                  No languages added yet.
               </Typography>
            ) : (
               <Box className="grid grid-cols-2 gap-2">
                  {languages.map(language => (
                     <Box
                        className="border-border flex w-full min-w-0 items-center justify-between rounded-lg border px-2 py-1"
                        key={language.id}>
                        <Box className="flex min-w-0 items-center gap-1.5">
                           <Typography className="truncate! text-xs!">
                              {language.languageName}
                           </Typography>

                           <Chip
                              className="h-5! shrink-0 text-[0.6rem]!"
                              label={formatLevel(language.level)}
                              size="small"
                           />
                        </Box>

                        <ProfileCardMenu
                           editData={language}
                           formType="language"
                        />
                     </Box>
                  ))}
               </Box>
            )}
         </CardContent>
      </Card>
   )
}

export default LanguagesCard
