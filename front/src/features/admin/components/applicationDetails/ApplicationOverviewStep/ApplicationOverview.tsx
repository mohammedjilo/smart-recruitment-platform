import { Box } from "@mui/material"
import type { AdminApplicationDetails } from "@/types/admin"
import ApplicationSummary from "./ApplicationSummary"
import RecommendationCard from "./RecommendationCard"

type ApplicationOverviewProps = {
   application: AdminApplicationDetails
}

const ApplicationOverview = ({ application }: ApplicationOverviewProps) => {
   return (
      <Box className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
         <ApplicationSummary application={application} />

         <RecommendationCard
            recommendation={application.recommendation}
            strengths={application.strengths}
            missingSkills={application.missingSkills}
         />
      </Box>
   )
}

export default ApplicationOverview
