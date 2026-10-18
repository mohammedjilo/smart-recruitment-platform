import type { LanguageLevel } from "../common/enums"

export type { LanguageLevel } from "../common/enums"

export type Language = {
   id: string
   languageName: string
}

export type UserLanguage = Language & {
   createdAt: string
   updatedAt: string
   userLanguageId: string
   level: LanguageLevel
}
