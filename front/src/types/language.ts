export type { Language, LanguageLevel } from "./entities/language"
import type { Language, LanguageLevel } from "./entities/language"

export type AddUserLanguageBody = {
   languageName: string
   level: LanguageLevel
}

export type AddUserLanguageResult = {
   status: string
   message?: string
   data: {
      id: string
      level: LanguageLevel
      language: Language
   }
}
