import type { CompanyRequest } from "@/types/admin"

export const getLogoUrl = (logoUrl: string | null) => {
   return (
      logoUrl ||
      "https://res.cloudinary.com/daqygkjf1/image/upload/v1755890964/cuedsbzrjnje47ftblsa.jpg"
   )
}

export const getCompanyLocation = (request: CompanyRequest) => {
   return request.location || "Not specified"
}
