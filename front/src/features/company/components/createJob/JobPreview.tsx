import React from "react"

import { CalendarToday, Groups, Numbers, VisibilityOutlined } from "@mui/icons-material"

import { Divider, Paper } from "@mui/material"
import type { JobFormData } from "@/types/createJob.types"
import EmploymentTypeBadge from "@/components/common/EmploymentTypeBadge"

interface JobPreviewProps {
   form: JobFormData
}

const JobPreview: React.FC<JobPreviewProps> = ({ form }) => {
   return (
      <Paper
         elevation={0}
         className="!rounded-[10px] !border !border-border !bg-surface p-4">
         <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-content">Job Preview</h3>

            <div className="flex items-center gap-2">
               <VisibilityOutlined
                  sx={{
                     fontSize: 17,
                     color: "#633cff"
                  }}
               />

               <span className="rounded bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-500">
                  DRAFT
               </span>
            </div>
         </div>

         <div className="rounded-lg border border-border p-4">
            <h3 className="text-[15px] font-semibold text-content">
               {form.title || "Job Title"}
            </h3>

            <div className="mt-2 flex items-center gap-2 text-[10px] text-muted">
               <span>Company Name</span>
               <span>•</span>
               <EmploymentTypeBadge
                  employmentType={form.employmentType || "Employment Type"}
               />
            </div>

            <Divider className="!my-3" />

            <PreviewRow
               icon={<Groups />}
               label={form.experience ? `${form.experience} Years` : "- Years"}
            />

            <PreviewRow
               icon={<Numbers />}
               label={form.salary ? `$${form.salary}` : "-"}
            />

            <PreviewRow
               icon={<CalendarToday />}
               label={form.deadline || "-"}
            />

            <p className="mt-4 line-clamp-3 text-[10px] leading-5 text-muted">
               {form.description || "Job description will appear here..."}
            </p>

            <div className="mt-3 border-t border-border" />
         </div>
      </Paper>
   )
}

const PreviewRow: React.FC<{
   icon: React.ReactNode
   label: string
}> = ({ icon, label }) => {
   return (
      <div className="mb-2.5 flex items-center gap-2">
         <div className="text-muted [&_svg]:text-[15px]">{icon}</div>

         <span className="text-[10px] text-muted">{label}</span>
      </div>
   )
}

export default JobPreview
