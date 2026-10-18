import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import EventOutlinedIcon from "@mui/icons-material/EventOutlined"
import type { CompanyJob } from "@/types/company"
import { formatDate } from "@/utils/jobDetails.utils"
import { Box, Typography } from "@mui/material"
import { formatJobDeadline } from "@/utils/jobDeadline"

type JobTimelineProps = {
   job: CompanyJob
}

const JobTimeline = ({ job }: JobTimelineProps) => {
   const items = [
      {
         title: "Job Created",
         date: formatDate(job.createdAt, true),
         icon: AddCircleOutlinedIcon
      },
      {
         title: "Job Updated",
         date: formatDate(job.updatedAt, true),
         icon: EditOutlinedIcon
      },
      {
         title: "Job Deadline",
         date: formatJobDeadline(job.deadline),
         icon: EventOutlinedIcon
      }
   ]

   return (
      <section className="bg-surface rounded-xl border p-5">
         <h3 className="text-content text-base font-semibold">Timeline</h3>

         <Box className="mt-6">
            {items.map((item, index) => {
               const isLast = index === items.length - 1

               return (
                  <Box
                     key={item.title}
                     className="relative flex gap-4 pb-7 last:pb-0">
                     {!isLast && (
                        <Box className="absolute top-5 left-2 h-[calc(100%-14px)] w-px bg-slate-200" />
                     )}

                     <Box className="relative z-10 flex h-4.25 w-4.25 shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <Box className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                     </Box>

                     <Box className="-mt-1">
                        <Typography className="text-sm! font-medium!">
                           {item.title}
                        </Typography>

                        <Typography
                           className="mt-1! text-xs!"
                           color="textSecondary">
                           {item.date}
                        </Typography>
                     </Box>
                  </Box>
               )
            })}
         </Box>
      </section>
   )
}

export default JobTimeline
