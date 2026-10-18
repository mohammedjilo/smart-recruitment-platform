import React from "react"

import {
   AccessTimeOutlined,
   CalendarMonthOutlined,
   FingerprintOutlined,
   VerifiedUserOutlined
} from "@mui/icons-material"

import { Paper } from "@mui/material"
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
         elevation={0}
         className="rounded-[10px]! border! p-5">
         <h2 className="text-[15px] font-semibold text-[#172033]">Account Information</h2>

         <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
            <AccountItem
               label="Member Since"
               icon={<CalendarMonthOutlined />}
               value={formatDate(company?.createdAt)}
            />

            <AccountItem
               label="Company ID"
               icon={<FingerprintOutlined />}
               value={company?.id ?? "-"}
            />

            <AccountItem
               label="Last Updated"
               icon={<AccessTimeOutlined />}
               value={formatDate(company?.updatedAt, true)}
            />

            <AccountItem
               label="Status"
               icon={<VerifiedUserOutlined />}
               value={company?.status ?? "-"}
            />
         </div>
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
      <div>
         <p className="mb-2 text-[11px] font-semibold text-content">{label}</p>

         <div className="flex min-h-10 items-center gap-3 rounded-md border border-border bg-bg/50 px-3">
            <div className="text-violet-600 [&>svg]:text-[16px]">{icon}</div>

            <span className="truncate text-[10px] text-muted">{value}</span>
         </div>
      </div>
   )
}

export default AccountInformation
