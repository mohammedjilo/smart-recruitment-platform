import {
   currentDateOnlyKey,
   isDateOnOrAfterToday,
   toDateOnlyKey
} from "@smart-recruitment/validation"

export const canAcceptApplications = (status: string, deadline: Date | string) =>
   status === "OPEN" && isDateOnOrAfterToday(deadline)

export const formatJobDeadline = (deadline: Date | string) => {
   const dateKey = toDateOnlyKey(deadline)
   if (!dateKey) return ""

   return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC"
   }).format(new Date(`${dateKey}T00:00:00.000Z`))
}

export const getJobDeadlineInfo = (deadline: Date | string) => {
   const dateKey = toDateOnlyKey(deadline)
   if (!dateKey) {
      return { text: "Invalid deadline", className: "text-red-500" }
   }

   const today = currentDateOnlyKey()
   const days =
      (Date.parse(`${dateKey}T00:00:00.000Z`) - Date.parse(`${today}T00:00:00.000Z`)) /
      86400000

   if (days > 0) {
      return { text: `${days} days left`, className: "text-green-600" }
   }
   if (days === 0) {
      return { text: "Today", className: "text-orange-500" }
   }
   return { text: `${Math.abs(days)} days ago`, className: "text-red-500" }
}
