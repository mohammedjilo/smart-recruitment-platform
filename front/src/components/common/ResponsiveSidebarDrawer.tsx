import { Drawer, useMediaQuery } from "@mui/material"
import type { ReactNode } from "react"

type ResponsiveSidebarDrawerProps = {
   children: ReactNode
   open: boolean
   onClose: () => void
   width: number
   top?: number
}

export default function ResponsiveSidebarDrawer({
   children,
   open,
   onClose,
   width,
   top = 0
}: ResponsiveSidebarDrawerProps) {
   const desktop = useMediaQuery("(min-width:1024px)")

   return (
      <Drawer
         variant={desktop ? "permanent" : "temporary"}
         open={desktop || open}
         onClose={onClose}
         ModalProps={{ keepMounted: true }}
         sx={{
            width: desktop ? width : undefined,
            flexShrink: 0,
            ...(desktop
               ? {
                    position: "fixed",
                    top: 0,
                    height: "100vh"
                 }
               : {}),
            "& .MuiDrawer-paper": {
               boxSizing: "border-box",
               width,
               ...(top
                  ? {
                       top,
                       height: `calc(100% - ${top}px)`
                    }
                  : {})
            }
         }}>
         {children}
      </Drawer>
   )
}
