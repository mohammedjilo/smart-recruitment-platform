import { formatDate as formatDateValue } from "@/utils/formatDate"

export const formatDate = (date: string | null) =>
   date ? formatDateValue(date, { format: "monthYear" }) : "Present"

export const formatExperience = (years: number | null) => {
   if (years === null) {
      return "Not specified"
   }

   return `${years} ${years === 1 ? "year" : "years"}`
}
