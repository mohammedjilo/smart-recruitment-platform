import type { LocationSelection } from "@/components/common/CountryCitySelector"

export type CompanyProfileFormValues = {
   companyName: string
   email: string
   phone: string
   website: string
   location: string
   locationSelection: LocationSelection
   description: string
}
