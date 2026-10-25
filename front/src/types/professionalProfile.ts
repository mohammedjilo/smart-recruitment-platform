export type GetProfessionalProfileBody = {
   status: string
   message: string
   data: {
      profile: {
         id: string
         jobTitle: string | null
         summary: string | null
         yearsOfExperience: number | null
         cvPath: string | null
      }
      completion: {
         basicInformation: boolean
         certificates: boolean
         educations: boolean
         experiences: boolean
         percentage: number
         projects: boolean
         skills: boolean
         isCompleted: boolean
      }
   }
}
