import {
   BusinessCenterOutlined,
   CheckCircleOutlined,
   GroupsOutlined
} from "@mui/icons-material"
import { Box } from "@mui/material"
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
         <h2 className="text-[18px] font-bold text-[#171c34]">{title}</h2>
      </Box>
      <Box className="mt-4 pl-14 text-[15px] leading-[1.75] text-[#111936]">
         {children}
      </Box>
   </section>
)

const JobDescription = ({ job }: JobDescriptionProps) => {
   const skills = job.skills?.map(item => item.skill?.skillName) ?? []

   return (
      <section className="bg-surface rounded-xl border border-[#e8eaf0] px-6 py-6 shadow-[0_2px_8px_rgba(20,30,60,0.035)] lg:px-7">
         <JobContentSection
            icon={<BusinessCenterOutlined sx={{ fontSize: 21 }} />}
            title="About the Role">
            <p>
               We&apos;re looking for a <strong>{job.title}</strong> to join our team and
               help build beautiful, fast, and scalable web experiences used by millions
               of users around the world.
            </p>
         </JobContentSection>

         <JobContentSection
            icon={<CheckCircleOutlined sx={{ fontSize: 21 }} />}
            title="What You'll Do">
            <ul className="list-disc space-y-2 pl-5">
               <li>Build reusable, scalable, and high-performance UI components.</li>
               <li>Collaborate with designers and backend engineers.</li>
               <li>Optimize applications for maximum speed and scalability.</li>
               <li>Ensure the technical feasibility of UI/UX designs.</li>
               <li>Write clean, maintainable, and testable code.</li>
            </ul>
         </JobContentSection>

         <JobContentSection
            icon={<GroupsOutlined sx={{ fontSize: 21 }} />}
            title="Requirements">
            <ul className="list-disc space-y-2 pl-5">
               <li>3+ years of experience in frontend development.</li>
               <li>
                  Strong experience with{" "}
                  {skills.length > 0
                     ? skills.slice(0, 3).join(", ")
                     : "modern JavaScript"}
                  .
               </li>
               <li>Experience with modern CSS frameworks.</li>
               <li>Experience with modern frontend frameworks is a plus.</li>
               <li>Bachelor&apos;s degree in Computer Science or related field.</li>
            </ul>
         </JobContentSection>
      </section>
   )
}

export default JobDescription
