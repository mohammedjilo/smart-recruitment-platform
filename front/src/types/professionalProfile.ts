export type GetProfessionalProfileBody = {
   status: string
   message: string
   data: {
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
