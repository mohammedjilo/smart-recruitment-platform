import { Alert, Snackbar, type AlertColor } from "@mui/material"
import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
   type ReactNode
} from "react"

export type ToastSeverity = "success" | "error" | "info" | "warning"

export interface ToastOptions {
   title?: string
   message?: string
   severity?: ToastSeverity
   duration?: number
   dedupeKey?: string
}

interface ToastItem extends ToastOptions {
   id: string
}

interface ToastContextValue {
   showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastPublisher: ((options: ToastOptions) => void) | null = null

export function showToast(options: ToastOptions) {
   toastPublisher?.(options)
}

export function ToastProvider({ children }: { children: ReactNode }) {
   const [items, setItems] = useState<ToastItem[]>([])

   const pushToast = useCallback((options: ToastOptions) => {
      const dedupeKey =
         options.dedupeKey ??
         `${options.severity ?? "info"}:${options.title ?? ""}:${options.message ?? ""}`

      setItems(current => {
         if (current.some(item => item.dedupeKey === dedupeKey)) {
            return current
         }

         const id =
            typeof crypto !== "undefined" && "randomUUID" in crypto
               ? crypto.randomUUID()
               : `${Date.now()}-${Math.random()}`

         return [...current, { ...options, dedupeKey, id }]
      })
   }, [])

   useEffect(() => {
      toastPublisher = pushToast
      return () => {
         toastPublisher = null
      }
   }, [pushToast])

   const removeToast = useCallback((id: string) => {
      setItems(current => current.filter(item => item.id !== id))
   }, [])

   const value = useMemo(
      () => ({
         showToast: pushToast
      }),
      [pushToast]
   )

   return (
      <ToastContext.Provider value={value}>
         {children}
         {items.map(item => {
            const severity: AlertColor = item.severity ?? "info"
            const title = item.title
            const message = item.message ?? ""

            return (
               <Snackbar
                  className="mt-2!"
                  key={item.id}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  autoHideDuration={item.duration ?? 4000}
                  open
                  onClose={(_event, reason) => {
                     if (reason === "clickaway") {
                        return
                     }
                     removeToast(item.id)
                  }}>
                  <Alert
                     className="w-full!"
                     severity={severity}
                     variant="filled"
                     onClose={() => removeToast(item.id)}>
                     {title && (
                        <strong
                           style={{ display: "block", marginBottom: message ? 4 : 0 }}>
                           {title}
                        </strong>
                     )}
                     {message}
                  </Alert>
               </Snackbar>
            )
         })}
      </ToastContext.Provider>
   )
}

export function useToast() {
   const context = useContext(ToastContext)

   if (!context) {
      throw new Error("useToast must be used within a ToastProvider")
   }

   return context
}
