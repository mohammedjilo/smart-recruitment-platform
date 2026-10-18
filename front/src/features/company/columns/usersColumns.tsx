import { useNavigate } from "react-router-dom"

import { Avatar, Box, Button, Typography } from "@mui/material"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"

import type { DataTableColumn } from "@/components/common/DataTable"
import type { CompanyUser } from "@/types/company"

import UserSkills from "@/features/company/components/users/UserSkills"
import { formatDate } from "@/utils/formatDate"

const UserActionsCell = ({ user }: { user: CompanyUser }) => {
   const navigate = useNavigate()

   const handleViewProfile = () => {
      navigate(`/company/users/${user.id}/profile`)
   }

   return (
      <Box className="flex justify-end">
         <Button
            onClick={handleViewProfile}
            variant="outlined"
            size="small"
            startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
            className="rounded-lg! px-3! py-1.5! text-xs! font-semibold! normal-case!">
            View
         </Button>
      </Box>
   )
}

export const getCompanyUsersColumns = (): DataTableColumn<CompanyUser>[] => [
   {
      id: "user",
      header: "User",
      width: 280,
      render: user => {
         const fullName = `${user.firstName} ${user.lastName}`.trim()

         return (
            <Box className="flex min-w-0 items-center gap-4">
               <Avatar
                  src={user.profilePicUrl || undefined}
                  alt={fullName}
                  className="border-border h-12 w-12 shrink-0 border">
                  {!user.profilePicUrl && <PersonOutlineOutlinedIcon />}
               </Avatar>

               <Box className="min-w-0">
                  <Typography className="line-clamp-1! truncate! text-sm! font-semibold!">
                     {fullName}
                  </Typography>

                  <Typography
                     className="mt-1! line-clamp-1! truncate! text-xs!"
                     color="textSecondary">
                     {user.email}
                  </Typography>
               </Box>
            </Box>
         )
      }
   },
   {
      id: "professional-info",
      header: "Professional Info",
      width: 260,
      render: user => (
         <Box className="min-w-0">
            <Typography className="line-clamp-1! truncate! text-sm! font-semibold!">
               {user.professionalProfile?.jobTitle || "Not specified"}
            </Typography>

            <Typography
               className="mt-1! line-clamp-2! text-xs!"
               color="textSecondary">
               {user.professionalProfile?.summary || "No professional summary provided."}
            </Typography>
         </Box>
      )
   },
   {
      id: "skills",
      header: "Skills",
      width: 220,
      render: user => <UserSkills skills={user.skills} />
   },
   {
      id: "experience",
      header: "Experience",
      width: 120,
      render: user => (
         <Typography
            className="text-sm!"
            color="textSecondary">
            {user.professionalProfile?.yearsOfExperience !== null &&
            user.professionalProfile?.yearsOfExperience !== undefined
               ? `${user.professionalProfile.yearsOfExperience} ${
                    user.professionalProfile.yearsOfExperience === 1 ? "year" : "years"
                 }`
               : "—"}
         </Typography>
      )
   },
   {
      id: "joined",
      header: "Joined",
      width: 140,
      render: user => (
         <Typography
            className="text-sm!"
            color="textSecondary">
            {formatDate(user.createdAt)}
         </Typography>
      )
   },
   {
      id: "actions",
      header: "Actions",
      align: "center",
      width: 70,
      render: user => <UserActionsCell user={user} />
   }
]
