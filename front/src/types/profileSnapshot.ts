import type { LanguageLevel } from "./common/enums"

export type ProfileSnapshot = {
   firstName: string
   lastName: string
   email: string
   phone: string
   country: string
   age: string
   jobTitle: string
   yearsOfExperience: number | null

   educations: {
      major: string
      university: string
      degree: string
   }[]

   languages: {
      language: string
      level?: LanguageLevel
   }[]

   experiences: {
      companyName: string
      description: string
      position: string
      startDate: string
      endDate: string | null
   }[]

   projects: {
      title: string
      description: string
   }[]

   certificates: {
      certificateName: string
      organization: string
   }[]

   skills: string[]
}
