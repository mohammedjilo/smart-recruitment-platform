import { BusinessCenterOutlined } from "@mui/icons-material"
import { Box, Typography } from "@mui/material"
import type { ReactElement, ReactNode } from "react"
import type { SvgIconProps } from "@mui/material/SvgIcon"
import type { JobDetails } from "@/types/api/jobs"

type JobDescriptionProps = {
   job: JobDetails
}

type JobContentSectionProps = {
   icon: ReactElement<SvgIconProps>
   title: string
   children: ReactNode
}

const JobContentSection = ({ icon, title, children }: JobContentSectionProps) => (
   <section className="mb-9 last:mb-0">
      <Box className="flex items-center gap-4">
         <Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0eaff] text-[#5421e8]">
            {icon}
         </Box>
         <Typography
            className="text-[18px]! font-bold!"
            variant="h2">
            {title}
         </Typography>
      </Box>
      <Box className="mt-4 pl-14 text-[15px] leading-[1.75] text-[#111936]">
         {children}
      </Box>
   </section>
)

const JobDescription = ({ job }: JobDescriptionProps) => {
   return (
      <section className="bg-surface rounded-xl border border-[#e8eaf0] px-6 py-6 shadow-[0_2px_8px_rgba(20,30,60,0.035)] lg:px-7">
         <JobContentSection
            icon={<BusinessCenterOutlined className="text-[21px]!" />}
            title="Job Description">
            <Typography className="whitespace-pre-line">
               {job.description}
            </Typography>
         </JobContentSection>
      </section>
   )
}

export default JobDescription
