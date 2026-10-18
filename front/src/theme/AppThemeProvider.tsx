import { createContext, useMemo, useRef, useState, type ReactNode } from "react"
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material"
import { neutrals, roles, type Role } from "./tokens"

export const RoleThemeContext = createContext<((role: Role) => void) | null>(null)

interface AppThemeProviderProps {
   children: ReactNode
   role?: Role
}

export function AppThemeProvider({ children, role = "user" }: AppThemeProviderProps) {
   const [activeRole, setActiveRole] = useState<Role>(role)
   const previousRoleProp = useRef(role)

   if (previousRoleProp.current !== role) {
      previousRoleProp.current = role
      setActiveRole(role)
   }

   const colors = roles[activeRole] ?? roles.user

   const theme = useMemo(
      () =>
         createTheme({
            breakpoints: {
               values: {
                  xs: 0,
                  sm: 640,
                  md: 768,
                  lg: 1024,
                  xl: 1280
               }
            },
            palette: {
               primary: {
                  main: colors.primary,
                  dark: colors.primaryDark,
                  light: colors.primaryTint,
                  contrastText: "#FFFFFF"
               },
               secondary: {
                  main: colors.primary,
                  dark: colors.primaryDark,
                  light: colors.primaryTint,
                  contrastText: "#FFFFFF"
               },
               action: {
                  hover: colors.primaryTint,
                  selected: colors.primaryTint,
                  focus: colors.primaryDark
               },
               background: {
                  default: neutrals.bg,
                  paper: neutrals.surface
               },
               text: {
                  primary: neutrals.text,
                  secondary: neutrals.muted
               },
               divider: neutrals.border
            },
            typography: {},
            components: {
               MuiButton: {
                  styleOverrides: {
                     root: {
                        "&.Mui-focusVisible": {
                           outline: `2px solid ${colors.primaryDark}`,
                           outlineOffset: "2px"
                        }
                     }
                  }
               },
               MuiIconButton: {
                  styleOverrides: {
                     root: {
                        "&.Mui-focusVisible": {
                           outline: `2px solid ${colors.primaryDark}`,
                           outlineOffset: "2px"
                        }
                     }
                  }
               },
               MuiAppBar: {
                  styleOverrides: {
                     root: {
                        color: "#FFFFFF",
                        backgroundColor: colors.primary
                     }
                  }
               },
               MuiListItemButton: {
                  styleOverrides: {
                     root: {
                        "& .MuiListItemIcon-root": {
                           color: colors.primaryDark
                        },
                        ":hover": {
                           backgroundColor: colors.primary,
                           color: "#FFFFFF",
                           "& .MuiListItemIcon-root": {
                              color: "#FFFFFF"
                           }
                        }
                     }
                  }
               }
            }
         }),
      [colors]
   )

   return (
      <RoleThemeContext.Provider value={setActiveRole}>
         <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
         </ThemeProvider>
      </RoleThemeContext.Provider>
   )
}
