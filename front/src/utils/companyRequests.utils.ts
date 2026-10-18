export const formatDate = (date: string, withTime = false) => {
   const parsedDate = new Date(date)

   return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...(withTime
         ? {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
           }
         : {})
   }).format(parsedDate)
}
