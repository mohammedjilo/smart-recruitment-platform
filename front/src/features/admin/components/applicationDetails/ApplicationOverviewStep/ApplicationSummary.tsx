import { Box, Typography } from "@mui/material"

import ApplicationStatusChip from "@/components/common/ApplicationStatusChip"
import type { AdminApplicationDetails } from "@/types/admin"
import { formatDate } from "@/utils/formatDate"

type ApplicationSummaryProps = {
   application: AdminApplicationDetails
}

const ApplicationSummary = ({ application }: ApplicationSummaryProps) => {
   return (
      <Box className="rounded-xl border bg-surface p-6">
         <Typography className="text-sm! font-bold! text-content">
            Application Summary
         </Typography>

         <Box className="mt-6 space-y-5">
            <SummaryRow
               label="Status"
               value={<ApplicationStatusChip status={application.status} />}
            />

            <SummaryRow
               label="Match Score"
               value={
                  application.matchScore === null ? "—" : `${application.matchScore}%`
               }
            />

            <SummaryRow
               label="Resume Type"
               value={application.resumeType}
            />

            <SummaryRow
               label="Applied On"
               value={formatDate(application.createdAt, { format: "dateTime" })}
            />

            <SummaryRow
               label="Last Updated"
               value={formatDate(application.updatedAt, { format: "dateTime" })}
            />
         </Box>
      </Box>
   )
}

type SummaryRowProps = {
   label: string
   value: React.ReactNode
}

const SummaryRow = ({ label, value }: SummaryRowProps) => {
   return (
      <Box className="grid grid-cols-[120px_1fr] items-center gap-4">
         <Typography className="text-xs!">{label}</Typography>

         <Box>
            {typeof value === "string" ? (
               <Typography
                  className="text-xs! font-semibold!"
                  color="textSecondary">
                  {value}
               </Typography>
            ) : (
               value
            )}
         </Box>
      </Box>
   )
}

export default ApplicationSummary
