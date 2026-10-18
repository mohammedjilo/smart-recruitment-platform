// utils/swal.ts
import Swal from "sweetalert2"
import { showToast, type ToastSeverity } from "@/components/common/ToastProvider"

type SwalType = "success" | "error" | "confirm" | "info" | "warning"

interface SwalOptions {
   type: SwalType
   title?: string
   text?: string
   confirmText?: string
   cancelText?: string
   onConfirm?: () => void
   onCancel?: () => void
}

const getToastSeverity = (type: Exclude<SwalType, "confirm">): ToastSeverity => {
   switch (type) {
      case "success":
         return "success"
      case "error":
         return "error"
      case "warning":
         return "warning"
      default:
         return "info"
   }
}

export const showAlert = async (options: SwalOptions) => {
   const { type, title, text, confirmText, cancelText, onConfirm, onCancel } = options

   if (type === "confirm") {
      const baseConfig: any = {
         icon: "warning",
         title: title || "Confirm action",
         text: text || ""
      }

      const result = await Swal.fire({
         ...baseConfig,
         showCancelButton: true,
         confirmButtonColor: "#d33",
         cancelButtonColor: "#3085d6",
         confirmButtonText: confirmText || "Yes, confirm",
         cancelButtonText: cancelText || "Cancel"
      })

      if (result.isConfirmed) {
         onConfirm?.()
      } else {
         onCancel?.()
      }
      return result
   }

   showToast({
      title:
         title ||
         (type === "success"
            ? "Success"
            : type === "error"
              ? "Error"
              : type === "warning"
                ? "Warning"
                : "Notice"),
      message: text,
      severity: getToastSeverity(type),
      duration: type === "success" ? 4000 : 6000
   })

   return undefined
}
