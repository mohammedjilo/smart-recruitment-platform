import React from "react"

import {
   AccessTimeOutlined,
   CalendarMonthOutlined,
   FingerprintOutlined,
   VerifiedUserOutlined
} from "@mui/icons-material"

import { Box, Paper, Typography } from "@mui/material"
import { formatDate } from "@/utils/formatDate"

interface AccountInformationProps {
   company?: {
      id?: string
      createdAt?: string
      updatedAt?: string
      status?: string
   }
}

const AccountInformation: React.FC<AccountInformationProps> = ({ company }) => {
   return (
      <Paper
         className="rounded-[10px]! border! p-5"
         elevation={0}>
         <Typography
            className="text-[15px]! font-semibold!"
            variant="h2">
            Account Information
         </Typography>

         <Box className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
            <AccountItem
               value={formatDate(company?.createdAt)}
               icon={<CalendarMonthOutlined />}
               label="Member Since"
            />

            <AccountItem
               value={company?.id ?? "-"}
               icon={<FingerprintOutlined />}
               label="Company ID"
            />

            <AccountItem
               value={formatDate(company?.updatedAt, true)}
               icon={<AccessTimeOutlined />}
               label="Last Updated"
            />

            <AccountItem
               value={company?.status ?? "-"}
               icon={<VerifiedUserOutlined />}
               label="Status"
            />
         </Box>
      </Paper>
   )
}

interface AccountItemProps {
   label: string
   icon: React.ReactNode
   value: string
}

const AccountItem: React.FC<AccountItemProps> = ({ label, icon, value }) => {
   return (
      <Box>
         <Typography className="mb-2! text-[11px]! font-semibold! text-content!">
            {label}
         </Typography>

         <Box className="flex min-h-10 items-center gap-3 rounded-md border border-border bg-bg/50 px-3">
            <Box className="text-violet-600 [&>svg]:text-[16px]">{icon}</Box>

            <span className="truncate text-[10px] text-muted">{value}</span>
         </Box>
      </Box>
   )
}

export default AccountInformation
