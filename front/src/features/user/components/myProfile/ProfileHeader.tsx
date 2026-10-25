import { Box, Card, CardContent, Chip, Divider, Typography, Avatar } from "@mui/material"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"

import type { CompleteUserProfile } from "@/types/user"
import { formatDate as formatDateValue } from "@/utils/formatDate"

import ProfileCardMenu from "./ProfileCardMenu"

type Props = {
   profile: CompleteUserProfile
}

const formatDate = (date?: string | Date | null) =>
   formatDateValue(date instanceof Date ? date.toISOString() : date) || "-"

const calculateAge = (birthdate?: string | null) => {
   if (!birthdate) return null

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

const ProfileHeader = ({ profile }: Props) => {
   const age = calculateAge(profile.birthdate)

   return (
      <Card className="rounded-xl! border! shadow-none!">
         <CardContent className="p-4! md:p-6!">
            <Box className="grid gap-3 md:grid-cols-[1.15fr_1px_0.85fr] md:gap-4">
               {/* Left Side */}
               <Box className="flex items-start gap-2.5">
                  <Avatar
                     className="h-22! w-22! shrink-0 text-[2rem]!"
                     alt={`${profile.firstName} ${profile.lastName}`}
                     src={profile.profilePicUrl ?? undefined}>
                     {profile.firstName?.charAt(0)}
                  </Avatar>

                  <Box>
                     <Box className="flex flex-wrap items-center gap-1">
                        <Typography>
                           {profile.firstName} {profile.lastName}
                        </Typography>

                        <Chip
                           className="h-5.5! text-[0.65rem]! font-semibold!"
                           label={
                              profile.accountStatus === "ACTIVE"
                                 ? "Active Account"
                                 : "Inactive Account"
                           }
                           size="small"
                        />
                     </Box>

                     <Box className="gap-1.2 mt-2 flex flex-col">
                        <ProfileInfoRow
                           icon={<EmailOutlinedIcon />}
                           text={profile.email}
                        />

                        <ProfileInfoRow
                           icon={<PhoneOutlinedIcon />}
                           text={profile.phone || "-"}
                        />

                        <ProfileInfoRow
                           icon={<LocationOnOutlinedIcon />}
                           text={profile.country || "-"}
                        />

                        <ProfileInfoRow
                           icon={<CalendarMonthOutlinedIcon />}
                           text={
                              profile.birthdate
                                 ? `${formatDate(profile.birthdate)}${
                                      age !== null ? ` (${age} years old)` : ""
                                   }`
                                 : "-"
                           }
                        />

                        <Typography
                           className="mt-0.5! text-xs!"
                           color="textSecondary">
                           Member since {formatDate(profile.createdAt)}
                        </Typography>
                     </Box>
                  </Box>
               </Box>

               {/* Divider */}
               <Divider
                  className="hidden md:block!"
                  orientation="vertical"
               />

               {/* Right Side */}
               <Box className="flex flex-col justify-center gap-2">
                  <Box className="flex justify-end">
                     <ProfileCardMenu
                        editData={profile}
                        formType="personalInformation"
                     />
                  </Box>

                  <ProfileDetailRow
                     value={String(profile.role)}
                     chip
                     label="Role"
                  />

                  <ProfileDetailRow
                     value={profile.accountStatus}
                     chip
                     label="Account Status"
                  />

                  <ProfileDetailRow
                     value={formatDate(profile.createdAt)}
                     label="Member Since"
                  />

                  <ProfileDetailRow
                     value={formatDate(profile.updatedAt)}
                     label="Last Updated"
                  />
               </Box>
            </Box>
         </CardContent>
      </Card>
   )
}

type ProfileInfoRowProps = {
   icon: React.ReactNode
   text: string
}

const ProfileInfoRow = ({ icon, text }: ProfileInfoRowProps) => {
   return (
      <Box className="flex min-w-0 items-center gap-1">
         <Box className="text-muted flex [&>svg]:text-[16px]">{icon}</Box>

         <Typography
            className="text-xs!"
            color="textSecondary"
            noWrap>
            {text}
         </Typography>
      </Box>
   )
}

type ProfileDetailRowProps = {
   label: string
   value: string
   chip?: boolean
}

const ProfileDetailRow = ({ label, value, chip = false }: ProfileDetailRowProps) => {
   return (
      <Box className="grid grid-cols-[120px_1fr] items-center gap-2">
         <Typography
            className="text-xs!"
            color="textSecondary">
            {label}
         </Typography>

         {chip ? (
            <Chip
               className="h-5.5! w-fit! text-[0.65rem]! font-bold!"
               label={value}
               size="small"
            />
         ) : (
            <Typography className="text-xs!">{value}</Typography>
         )}
      </Box>
   )
}

export default ProfileHeader
