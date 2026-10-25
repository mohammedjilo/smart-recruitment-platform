import React from "react"
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined"
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined"
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined"
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined"
import { Box, Button, Typography } from "@mui/material"

type Props = {
   responseTime: string
   supportHours: string
   contactEmail: string
   onCreateRequest?: () => void
}

export default function NeedMoreHelpCard({
   responseTime,
   supportHours,
   contactEmail,
   onCreateRequest
}: Props) {
   return (
      <Box className="rounded-xl border border-border bg-linear-to-br from-blue-50 to-slate-50 p-5">
         <Box className="flex justify-center">
            <Box className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
               <SupportAgentOutlinedIcon className="text-[29px]" />
            </Box>
         </Box>

         <Box className="mt-4">
            <Typography className="text-[17px]! font-bold! text-content!">
               Need more help?
            </Typography>

            <Typography className="mt-1! text-[12px]! leading-5!" color="textSecondary">
               Our support team is here to assist you with any questions or issues.
            </Typography>
         </Box>

         <Button
            className="mt-4! h-9.5! rounded-[7px]! text-[12px]! font-semibold! normal-case! shadow-none!"
            fullWidth
            startIcon={<Typography className="text-[18px]!">+</Typography>}
            variant="contained"
            onClick={onCreateRequest}>
            Create Support Request
         </Button>

         <Box className="mt-5 rounded-lg bg-surface p-4">
            <Typography className="text-[12px]! font-semibold! text-content!">
               Quick Information
            </Typography>

            <Box className="mt-4 space-y-4">
               <InfoItem
                  value={responseTime}
                  icon={<AccessTimeOutlinedIcon />}
                  label="Average response time"
               />

               <InfoItem
                  value={supportHours}
                  icon={<ScheduleOutlinedIcon />}
                  label="Support hours"
               />

               <InfoItem
                  value={contactEmail}
                  email
                  icon={<MailOutlineOutlinedIcon />}
                  label="Contact us"
               />
            </Box>
         </Box>
      </Box>
   )
}

type InfoItemProps = {
   icon: React.ReactNode
   label: string
   value: string
   email?: boolean
}

function InfoItem({ icon, label, value, email }: InfoItemProps) {
   return (
      <Box className="flex items-start gap-3">
         <Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <Typography className="text-[16px]!">{icon}</Typography>
         </Box>

         <Box>
            <Typography className="text-[10px]!" color="textSecondary">{label}</Typography>

            <Typography
               className={`mt-0.5! text-[11px]! ${email ? "text-blue-500! underline!" : ""} `}
               color={email ? undefined : "textSecondary"}>
               {value}
            </Typography>
         </Box>
      </Box>
   )
}
