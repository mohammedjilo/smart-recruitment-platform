import { createElement } from "react"

import type { ApplicationStatus } from "@/types/common/enums"
import { APPLICATION_STATUS_CONFIG } from "@/types/common/status"
import { employmentStyles } from "@/components/common/EmploymentTypeChip"

const applicationStatusDescriptions: Record<ApplicationStatus, string> = {
   PENDING:
      "Your application has been submitted and is waiting for the company to review it.",
   REVIEWING:
      "The company has started reviewing your application (CV, skills, experience, etc.).",
   SHORTLISTED: "You have been selected as one of the top candidates for this job.",
   INTERVIEW: "You have been invited to an interview with the company.",
   ACCEPTED: "The company has selected you for the job. Congratulations!",
   REJECTED: "The company has decided not to move forward with your application.",
   WITHDRAWN: "You have withdrawn your application."
}

const applicationStatusOrder: ApplicationStatus[] = [
   "PENDING",
   "REVIEWING",
   "SHORTLISTED",
   "INTERVIEW",
   "ACCEPTED",
   "REJECTED",
   "WITHDRAWN"
]

export const applicationStatuses = applicationStatusOrder.map(status => {
   const config = APPLICATION_STATUS_CONFIG[status]
   const Icon = config.icon

   return {
      title: config.label,
      description: applicationStatusDescriptions[status],
      icon: createElement(Icon, { fontSize: "small" }),
      iconClass: config.className
   }
})

export const employmentTypes = [
   {
      title: employmentStyles.FULL_TIME.label,
      description: "A permanent position with a standard weekly schedule.",
      className: employmentStyles.FULL_TIME.className
   },
   {
      title: employmentStyles.PART_TIME.label,
      description: "A position with fewer hours than a full-time role.",
      className: employmentStyles.PART_TIME.className
   },
   {
      title: employmentStyles.CONTRACT.label,
      description: "A fixed-term position or project-based role.",
      className: employmentStyles.CONTRACT.className
   },
   {
      title: employmentStyles.INTERNSHIP.label,
      description:
         "A training program for students or recent graduates to gain practical experience.",
      className: employmentStyles.INTERNSHIP.className
   },
   {
      title: employmentStyles.FREELANCE.label,
      description: "Work as an independent contractor, not as a full-time employee.",
      className: employmentStyles.FREELANCE.className
   },
   {
      title: employmentStyles.REMOTE.label,
      description:
         "Work from anywhere, without the need to be physically present at the company's office.",
      className: employmentStyles.REMOTE.className
   }
]
