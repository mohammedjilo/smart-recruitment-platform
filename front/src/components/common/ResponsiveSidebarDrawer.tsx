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
         className="shrink-0!"
         ModalProps={{ keepMounted: true }}
         open={desktop || open}
         sx={{
            width: desktop ? width : undefined,
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
               overflow: "hidden",
               ...(top
                  ? {
                       top,
                       height: `calc(100% - ${top}px)`
                    }
                  : {})
            }
         }}
         variant={desktop ? "permanent" : "temporary"}
         onClose={onClose}>
         {children}
      </Drawer>
   )
}
