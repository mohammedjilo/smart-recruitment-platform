export type ExperienceBody = {
   companyName: string
   position: string
   description?: string // اختياري
   startDate: string // بصيغة YYYY-MM-DD
   endDate?: string | undefined // اختياري، يمكن أن يكون null
}
