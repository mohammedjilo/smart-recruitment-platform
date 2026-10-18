import { useContext, useEffect, type CSSProperties, type ReactNode } from "react"
import { neutrals, roles, type Role } from "./tokens"
import { RoleThemeContext } from "./AppThemeProvider"

interface RoleThemeProps {
   role?: Role
   children: ReactNode
}

export default function RoleTheme({ role = "user", children }: RoleThemeProps) {
   const setThemeRole = useContext(RoleThemeContext)

   if (!setThemeRole) {
      throw new Error("RoleTheme must be rendered inside AppThemeProvider")
   }

   const colors = roles[role] ?? roles.user
   const cssVars = {
      "--bg": neutrals.bg,
      "--surface": neutrals.surface,
      "--border": neutrals.border,
      "--text": neutrals.text,
      "--muted": neutrals.muted,
      "--primary": colors.primary,
      "--primary-dark": colors.primaryDark,
      "--primary-tint": colors.primaryTint,
      "--link": colors.primary,
      "--link-hover": colors.primaryDark
   } as CSSProperties

   useEffect(() => {
      setThemeRole(role)
   }, [role, setThemeRole])

   return (
      <div
         data-role={role}
         style={cssVars}
         className="bg-bg text-content min-h-screen">
         {children}
      </div>
   )
}
