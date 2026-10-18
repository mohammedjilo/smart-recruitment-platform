import { Box, Typography } from "@mui/material"

import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import type { AdminUserDetails } from "@/types/admin"
import { formatDate } from "@/utils/formatDate"

type PersonalInformationProps = {
   user: AdminUserDetails
}

const PersonalInformation = ({ user }: PersonalInformationProps) => {
   const calculateAge = (birthdate: string) => {
      const birth = new Date(birthdate)

      const today = new Date()

      let age = today.getFullYear() - birth.getFullYear()

      const monthDifference = today.getMonth() - birth.getMonth()

      if (
         monthDifference < 0 ||
         (monthDifference === 0 && today.getDate() < birth.getDate())
      ) {
         age--
      }

      return age
   }

   const age = calculateAge(user.birthdate)

   const information = [
      {
         label: "First Name",
         value: user.firstName
      },
      {
         label: "Last Name",
         value: user.lastName
      },
      {
         label: "Email",
         value: user.email
      },
      {
         label: "Phone",
         value: user.phone
      },
      {
         label: "Country",
         value: user.country
      },
      {
         label: "Birthdate",
         value: `${formatDate(user.birthdate)} (${age} years old)`
      }
   ]

   return (
      <Box className="rounded-xl border bg-surface p-5 shadow-sm md:p-6">
         <Box className="flex items-center gap-3">
            <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
               <PersonOutlineOutlinedIcon />
            </Box>

            <Typography className="text-base! font-semibold! text-content">
               Personal Information
            </Typography>
         </Box>

         <Box className="mt-7 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            {information.map(item => (
               <Box key={item.label}>
                  <Typography
                     className="text-xs!"
                     color="textSecondary">
                     {item.label}
                  </Typography>

                  <Typography className="mt-1! text-sm font-semibold!">
                     {item.value}
                  </Typography>
               </Box>
            ))}
         </Box>
      </Box>
   )
}

export default PersonalInformation
