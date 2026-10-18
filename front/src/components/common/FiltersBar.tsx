import { Box } from "@mui/material"
import type { ReactNode } from "react"

type FiltersBarProps = {
   children: ReactNode
   className?: string
   layout?: "row" | "grid"
   responsiveAt?: "sm" | "md" | "lg" | "xl"
}

export default function FiltersBar({
   children,
   className = "",
   layout = "row",
   responsiveAt = "md"
}: FiltersBarProps) {
   const rowClassName = {
      sm: "sm:flex-row sm:items-center",
      md: "md:flex-row md:items-center",
      lg: "lg:flex-row lg:items-center",
      xl: "xl:flex-row xl:items-center"
   }[responsiveAt]
   const layoutClassName =
      layout === "grid"
         ? "grid grid-cols-1 gap-3 md:grid-cols-6"
         : `flex flex-col items-stretch gap-3 ${rowClassName}`

   return (
      <Box
         className={`border-border bg-surface rounded-xl border p-4 ${layoutClassName} ${className}`}>
         {children}
      </Box>
   )
}
