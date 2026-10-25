import { Box, Paper, Typography, type SxProps, type Theme } from "@mui/material"
import type { ReactNode } from "react"

type StatCardProps = {
   label: ReactNode
   value: ReactNode
   description?: ReactNode
   icon?: ReactNode
   iconClassName?: string
   iconSx?: SxProps<Theme>
   className?: string
   layout?: "horizontal" | "stacked" | "vertical"
   footer?: ReactNode
}

export default function StatCard({
   label,
   value,
   description,
   icon,
   iconClassName = "",
   iconSx,
   className = "",
   layout = "horizontal",
   footer
}: StatCardProps) {
   const layoutClassName = {
      horizontal: "flex items-center gap-4",
      stacked: "flex flex-col items-start gap-3",
      vertical: "flex flex-col items-center gap-3 text-center"
   }[layout]

   const contentClassName =
      layout === "vertical" ? "flex flex-col items-center" : "min-w-0"
   const valueFirst = layout === "vertical"

   return (
      <Paper
         className={`border-border! bg-surface! rounded-xl! border! ${layoutClassName} p-4 ${className}`}
         elevation={0}>
         {icon && (
            <Box
               className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
               sx={{
                  ...iconSx,
                  "& .MuiSvgIcon-root": { fontSize: 20 }
               }}>
               {icon}
            </Box>
         )}

         <Box className={contentClassName}>
            {valueFirst ? (
               <Box className="contents">
                  <Typography className="text-2xl! font-bold!">{value}</Typography>
                  <Typography
                     className="mt-1! text-sm! font-medium!"
                     color="textSecondary">
                     {label}
                  </Typography>
               </Box>
            ) : (
               <Box className="contents">
                  <Typography
                     className="text-sm! font-medium!"
                     color="textSecondary">
                     {label}
                  </Typography>
                  <Typography className="mt-1! text-2xl! font-bold!">{value}</Typography>
               </Box>
            )}

            {description && (
               <Typography
                  className="mt-1! text-xs!"
                  color="textSecondary">
                  {description}
               </Typography>
            )}

            {footer}
         </Box>
      </Paper>
   )
}
