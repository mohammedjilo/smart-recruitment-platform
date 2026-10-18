import { Box, Card, CardContent, Divider, Typography } from "@mui/material"

import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined"
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined"
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined"
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined"
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined"
import type { UserProfileStats } from "@/types/user"

type Props = {
   stats: UserProfileStats
}

const ProfileOverviewCard = ({ stats }: Props) => {
   const items = [
      {
         label: "Applications",
         value: stats.applications,
         icon: <DescriptionOutlinedIcon />
      },
      {
         label: "Saved Jobs",
         value: stats.savedJobs,
         icon: <BookmarkBorderOutlinedIcon />
      },
      {
         label: "Messages",
         value: stats.messages,
         icon: <MessageOutlinedIcon />
      },
      {
         label: "Skills",
         value: stats.skills,
         icon: <PsychologyOutlinedIcon />
      },
      {
         label: "Certificates",
         value: stats.certificates,
         icon: <WorkspacePremiumOutlinedIcon />
      },
      {
         label: "Projects",
         value: stats.projects,
         icon: <FolderOutlinedIcon />
      },
      {
         label: "Experience",
         value: stats.experiences,
         icon: <BoltOutlinedIcon />
      }
   ]

   return (
      <Card className="rounded-xl! border! shadow-none!">
         <CardContent>
            <Box className="mb-2 flex items-center gap-1">
               <BoltOutlinedIcon
                  className="text-mui-purple"
                  fontSize="small"
               />

               <Typography className="text-content">Profile Overview</Typography>
            </Box>

            <Box>
               {items.map((item, index) => (
                  <Box key={item.label}>
                     <Box className="flex items-center justify-between py-1.25">
                        <Box className="text-muted flex items-center gap-1.25 [&>svg]:text-[17px]">
                           {item.icon}
                           <Typography>{item.label}</Typography>
                        </Box>

                        <Typography color="textSecondary">{item.value}</Typography>
                     </Box>

                     {index !== items.length - 1 && <Divider />}
                  </Box>
               ))}
            </Box>
         </CardContent>
      </Card>
   )
}

export default ProfileOverviewCard
