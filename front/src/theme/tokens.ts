export type Role = "user" | "company" | "admin"

export interface RoleColors {
   primary: string
   primaryDark: string // hover
   primaryTint: string // خلفيات خفيفة
}

export interface Neutrals {
   bg: string // خلفية الصفحة
   surface: string // الكروت والسايدبار
   border: string // الحدود
   text: string // النص الأساسي
   muted: string // النص الثانوي
}

// ─── خيارات المحايدات ───────────────────────────────
// A: خفيف ونظيف، والأزرق يبرز في الأزرار فقط (الموصى به)
// B: خلفية أغمق قليلاً فتظهر الكروت البيضاء بوضوح أكبر
const neutralOptions = {
   A: {
      bg: "#F8FAFC",
      surface: "#FFFFFF",
      border: "#E2E8F0",
      text: "#0F172A",
      muted: "#64748B"
   },
   B: {
      bg: "#F1F5F9",
      surface: "#FFFFFF",
      border: "#CBD5E1",
      text: "#0F172A",
      muted: "#475569" // أغمق لتحقيق تباين 4.5:1 على الخلفية
   }
} satisfies Record<string, Neutrals>

// ← بدّل بين 'A' و 'B' من هنا فقط
const ACTIVE_NEUTRALS: keyof typeof neutralOptions = "A"

export const neutrals: Neutrals = neutralOptions[ACTIVE_NEUTRALS]

export const muiBlueColors = {
   50: "#e3f2fd",
   100: "#bbdefb",
   200: "#90caf9",
   300: "#64b5f6",
   400: "#42a5f5",
   500: "#2196f3",
   600: "#1e88e5",
   700: "#1976d2",
   800: "#1565c0",
   900: "#0d47a1",
   950: "#082f6b",
   A100: "#82b1ff",
   A200: "#448aff",
   A400: "#2979ff",
   A700: "#2962ff"
} as const

// Role shades progress from lighter user actions to darker admin actions.
export const roles: Record<Role, RoleColors> = {
   user: {
      primary: muiBlueColors[700],
      primaryDark: muiBlueColors[800],
      primaryTint: muiBlueColors[50]
   },

   company: {
      primary: muiBlueColors[800],
      primaryDark: muiBlueColors[900],
      primaryTint: muiBlueColors[50]
   },

   admin: {
      primary: muiBlueColors[900],
      primaryDark: muiBlueColors[950],
      primaryTint: muiBlueColors[50]
   }
}

export const matchScoreColors = {
   high: "#10B981",
   medium: "#FACC15",
   low: "#F97316"
} as const

export const getMatchScoreColor = (score: number) => {
   if (score >= 80) {
      return matchScoreColors.high
   }

   if (score >= 60) {
      return matchScoreColors.medium
   }

   return matchScoreColors.low
}
