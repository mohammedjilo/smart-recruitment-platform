import React, { useState } from "react"
import { Box, Paper, Typography } from "@mui/material"
import { PersonOutlined } from "@mui/icons-material"
import type { CompanyApplication } from "@/types/application"
import ApplicationAnswers from "./ApplicationAnswers"
import ApplicationDetailsActions from "./ApplicationDetailsActions"
import ApplicationDetailsHeader from "./ApplicationDetailsHeader"
import ApplicationInsights from "./ApplicationInsights"
import ApplicationMatchScore from "./ApplicationMatchScore"
import ApplicationResume from "./ApplicationResume"
import ApplicationStatusAndDate from "./ApplicationStatusAndDate"
import CandidateInformation from "./CandidateInformation"

const normalizeArray = (value: unknown): string[] => {
   if (!value) return []

   if (Array.isArray(value)) {
      return value
         .map(item => {
            if (typeof item === "string") return item
            if (typeof item === "object" && item !== null && "name" in item) {
               return String((item as { name?: unknown }).name ?? "")
            }
            return String(item)
         })
         .filter(Boolean)
   }

   if (typeof value === "string") {
      return value
         .split(",")
         .map(item => item.trim())
         .filter(Boolean)
   }

   return []
}

interface ApplicationDetailsProps {
   application: CompanyApplication | null
   onClose: () => void
   onStatusUpdated: (applicationId: string, status: CompanyApplication["status"]) => void
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
   application,
   onClose,
   onStatusUpdated
}) => {
   const [areAnswersVisible, setAreAnswersVisible] = useState(false)

   if (!application) {
      return (
         <Paper
            className="flex min-h-150 items-center justify-center rounded-xl! border! bg-surface! p-6"
            elevation={0}>
            <Box className="text-center">
               <Box className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg">
                  <PersonOutlined className="text-muted!" />
               </Box>
               <Typography className="mt-3! text-[13px]! font-medium! text-content">
                  Select an application
               </Typography>
               <Typography className="mt-1! text-[11px]! leading-5! text-muted">
                  Select an application to view the candidate details.
               </Typography>
            </Box>
         </Paper>
      )
   }

   const fullName = `${application.user.firstName} ${application.user.lastName}`
   const strengths = normalizeArray(application.strengths)
   const missingSkills = normalizeArray(application.missingSkills)

   return (
      <Paper
         className="h-fit overflow-hidden rounded-xl! border! border-[#E7EAF0]! bg-surface!"
         elevation={0}>
         <ApplicationDetailsHeader application={application} onClose={onClose} />
         <ApplicationStatusAndDate application={application} />
         <ApplicationMatchScore score={Math.round(application.matchScore ?? 0)} />
         <ApplicationInsights
            missingSkills={missingSkills}
            recommendation={application.recommendation}
            strengths={strengths}
         />
         <ApplicationResume application={application} />
         <CandidateInformation application={application} fullName={fullName} />
         <ApplicationAnswers
            answers={application.answers ?? []}
            expanded={areAnswersVisible}
            onToggle={() => setAreAnswersVisible(visible => !visible)}
         />
         <ApplicationDetailsActions
            application={application}
            onStatusUpdated={status => onStatusUpdated(application.id, status)}
         />
      </Paper>
   )
}

export default ApplicationDetails
