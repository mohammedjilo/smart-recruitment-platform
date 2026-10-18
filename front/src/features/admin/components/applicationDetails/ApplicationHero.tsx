import { Box } from "@mui/material"
import type { AdminApplicationDetails } from "@/types/admin"
import CandidateInformation from "./CandidateInformation"
import ApplicationMetaInfo from "./ApplicationMetaInfo"
import JobInformation from "./JobInformation"

type ApplicationHeroProps = {
   application: AdminApplicationDetails
}

const ApplicationHero = ({ application }: ApplicationHeroProps) => {
   return (
      <Box className="overflow-hidden rounded-xl border bg-surface">
         <Box className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.85fr)]">
            <Box className="p-6">
               <CandidateInformation application={application} />

               <Box className="mt-7 border-t pt-6">
                  <ApplicationMetaInfo application={application} />
               </Box>
            </Box>

            <Box className="border-t xl:border-t-0 xl:border-l">
               <JobInformation job={application.job} />
            </Box>
         </Box>
      </Box>
   )
}

export default ApplicationHero
