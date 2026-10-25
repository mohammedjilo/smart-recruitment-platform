import { Box, Typography } from "@mui/material"

import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined"

import { EmptyText, SectionTitle } from "./ExperienceSection"
import type { ProfileSnapshot } from "@/types/profileSnapshot"

type LanguagesSectionProps = {
   languages?: ProfileSnapshot["languages"]
}

const LanguagesSection = ({ languages = [] }: LanguagesSectionProps) => {
   return (
      <Box className="rounded-xl border bg-surface p-5">
         <SectionTitle
            count={languages?.length ?? 0}
            icon={<LanguageOutlinedIcon />}
            title="Languages"
         />

         {(languages?.length ?? 0) === 0 ? (
            <EmptyText text="No languages available." />
         ) : (
            <Box className="mt-5 space-y-3">
               {languages.map((item, index) => (
                  <Box
                     className="flex items-center justify-between rounded-lg border px-4 py-3"
                     key={`${item.language}-${index}`}>
                     <Box className="flex items-center gap-3">
                        <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                           <LanguageOutlinedIcon />
                        </Box>

                        <Typography className="text-xs! font-semibold!">
                           {item.language}
                        </Typography>
                     </Box>
                     {item.level && (
                        <Typography className="text-muted text-xs!">
                           {item.level.charAt(0) + item.level.slice(1).toLowerCase()}
                        </Typography>
                     )}
                  </Box>
               ))}
            </Box>
         )}
      </Box>
   )
}

export default LanguagesSection
