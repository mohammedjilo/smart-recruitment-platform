import { Box, Paper, Typography } from "@mui/material"

import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined"
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined"
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined"
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined"
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined"
import type { ProfileSnapshot } from "@/types/profileSnapshot"
import { formatExperience } from "@/utils/profileSnapShot.utils"

type SnapshotStatsProps = {
   snapshot: ProfileSnapshot
}

const SnapshotStats = ({ snapshot }: SnapshotStatsProps) => {
   const stats = [
      {
         label: "Experience",
         value: formatExperience(snapshot.yearsOfExperience),
         icon: <WorkOutlineOutlinedIcon />
      },
      {
         label: "Education",
         value: snapshot.educations?.length ?? 0,
         icon: <SchoolOutlinedIcon />
      },
      {
         label: "Skills",
         value: snapshot.skills?.length ?? 0,
         icon: <AccountTreeOutlinedIcon />
      },
      {
         label: "Projects",
         value: snapshot.projects?.length ?? 0,
         icon: <FolderOutlinedIcon />
      },
      {
         label: "Certificates",
         value: snapshot.certificates?.length ?? 0,
         icon: <WorkspacePremiumOutlinedIcon />
      },
      {
         label: "Languages",
         value: snapshot.languages?.length ?? 0,
         icon: <LanguageOutlinedIcon />
      }
   ]

   return (
      <Paper
         className="bg-surface overflow-hidden rounded-xl border"
         elevation={0}>
         <Box className="grid grid-cols-2 divide-x md:grid-cols-3 xl:grid-cols-6">
            {stats.map(stat => (
               <Box
                  className="flex items-center gap-3 px-5 py-4"
                  key={stat.label}>
                  <Box className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                     {stat.icon}
                  </Box>

                  <Box>
                     <Typography
                        className="text-sm! font-medium!"
                        color="textSecondary">
                        {stat.label}
                     </Typography>

                     <Typography className="mt-1! text-lg! font-bold!">
                        {stat.value}
                     </Typography>
                  </Box>
               </Box>
            ))}
         </Box>
      </Paper>
   )
}

export default SnapshotStats
