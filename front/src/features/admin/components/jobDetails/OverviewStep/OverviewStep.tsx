import { Box } from "@mui/material"
import type { AdminJobDetails } from "@/types/admin"
import JobDescription from "./JobDescription"
import JobSkills from "./JobSkills"
import JobInformation from "./JobInformation"
import CompanyInformation from "./CompanyInformation"

type OverviewStepProps = {
   job: AdminJobDetails
}

const OverviewStep = ({ job }: OverviewStepProps) => (
   <Box className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
      <Box className="space-y-5">
         <JobDescription description={job.description} />
         <JobSkills skills={job.skills} />
         <JobInformation job={job} />
      </Box>
      <Box>
         <CompanyInformation company={job.company} />
      </Box>
   </Box>
)

export default OverviewStep
