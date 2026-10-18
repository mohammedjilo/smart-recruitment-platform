import { Box } from "@mui/material"
import type { EmploymentType } from "@/types/job"

type EmploymentTypeBadgeProps = {
   employmentType: EmploymentType | string
}

export const employmentStyles: Record<
   EmploymentType,
   { label: string; className: string }
> = {
   FULL_TIME: {
      label: "FULL_TIME",
      className: "bg-[#e9f9f0] text-[#22a15a]"
   },
   PART_TIME: {
      label: "PART_TIME",
      className: "bg-[#f0f9ff] text-[#1a8bcb]"
   },
   CONTRACT: {
      label: "CONTRACT",
      className: "bg-[#fff5dc] text-[#e99a00]"
   },
   INTERNSHIP: {
      label: "INTERNSHIP",
      className: "bg-[#e9f0ff] text-[#245dcc]"
   },
   FREELANCE: {
      label: "FREELANCE",
      className: "bg-[#f3eaff] text-[#8246e6]"
   },
   REMOTE: {
      label: "REMOTE",
      className: "bg-[#fce4ec] text-[#d6336c]"
   }
}

const EmploymentTypeBadge = ({ employmentType }: EmploymentTypeBadgeProps) => {
   const style = employmentStyles[employmentType as EmploymentType]

   return (
      <Box
         component="span"
         className={`inline-flex w-20 justify-center rounded-md px-2.5 py-1 text-xs ${style?.className ?? "bg-slate-100 text-slate-600"}`}>
         {style?.label ?? employmentType}
      </Box>
   )
}

export default EmploymentTypeBadge
