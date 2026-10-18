import { Alert } from "@mui/material"

interface FormErrorAlertProps {
   message?: string | null
}

export default function FormErrorAlert({ message }: FormErrorAlertProps) {
   if (!message) return null

   return (
      <Alert severity="error" role="alert" aria-live="assertive">
         {message}
      </Alert>
   )
}
