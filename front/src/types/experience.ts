export type ExperienceBody = {
   companyName: string
   position: string
   description?: string // Optional.
   startDate: string // In YYYY-MM-DD format.
   endDate?: string | undefined // Optional; may be null.
}
