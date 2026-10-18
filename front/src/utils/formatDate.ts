export type DateFormat = "date" | "longDate" | "dateTime" | "time" | "monthYear"

export type FormatDateOptions = {
   format?: DateFormat
   locale?: string
}

const DATE_FORMAT_OPTIONS: Record<DateFormat, Intl.DateTimeFormatOptions> = {
   date: {
      year: "numeric",
      month: "short",
      day: "numeric"
   },
   longDate: {
      year: "numeric",
      month: "long",
      day: "numeric"
   },
   dateTime: {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
   },
   time: {
      hour: "2-digit",
      minute: "2-digit"
   },
   monthYear: {
      year: "numeric",
      month: "short"
   }
}

export function formatDate(
   input: string | Date | null | undefined,
   options: FormatDateOptions | boolean = {}
): string {
   if (!input) return ""

   const date = input instanceof Date ? input : new Date(input)
   if (Number.isNaN(date.getTime())) return ""

   const normalizedOptions: FormatDateOptions =
      typeof options === "boolean" ? { format: options ? "dateTime" : "date" } : options
   const format = normalizedOptions.format ?? "date"
   const locale = normalizedOptions.locale ?? "en-US"

   return new Intl.DateTimeFormat(locale, DATE_FORMAT_OPTIONS[format]).format(date)
}

export function formatCreatedAt(input: string | Date, locale = "en-US"): string {
   const date = input instanceof Date ? input : new Date(input)
   if (Number.isNaN(date.getTime())) return ""

   const diffMs = Date.now() - date.getTime()
   const seconds = Math.floor(diffMs / 1000)
   const minutes = Math.floor(seconds / 60)
   const hours = Math.floor(minutes / 60)
   const days = Math.floor(hours / 24)

   const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

   if (Math.abs(days) >= 7) {
      return date.toLocaleDateString(locale, {
         year: "numeric",
         month: "short",
         day: "numeric"
      })
   }

   if (Math.abs(days) >= 1) return rtf.format(-days, "day")
   if (Math.abs(hours) >= 1) return rtf.format(-hours, "hour")
   if (Math.abs(minutes) >= 1) return rtf.format(-minutes, "minute")
   return rtf.format(-seconds, "second")
}

export default formatCreatedAt

export function calculateAge(birthDate: string | Date | null | undefined): number {
   if (!birthDate) return 0

   // تحويل إلى كائن Date
   const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate

   // التحقق من صحة التاريخ
   if (isNaN(birth.getTime())) {
      console.warn("تاريخ غير صحيح")
      return 0
   }

   // استخراج اليوم والشهر والسنة من تاريخ الميلاد (للتخلص من الوقت)
   const birthYear = birth.getFullYear()
   const birthMonth = birth.getMonth() // 0-11
   const birthDay = birth.getDate()

   // التاريخ الحالي (نأخذ التاريخ الحالي مع تجاهل الوقت أيضاً)
   const today = new Date()
   const todayYear = today.getFullYear()
   const todayMonth = today.getMonth()
   const todayDay = today.getDate()

   // حساب العمر المبدئي
   let age = todayYear - birthYear

   // التحقق مما إذا كان عيد الميلاد قد مرَّ هذا العام أم لا
   const hasBirthdayPassed =
      todayMonth > birthMonth || (todayMonth === birthMonth && todayDay >= birthDay)

   if (!hasBirthdayPassed) {
      age--
   }

   return age
}
