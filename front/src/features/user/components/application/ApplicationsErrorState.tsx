import { Alert, Box, Button } from "@mui/material"

interface ApplicationsErrorStateProps {
   onRetry: () => void
   message?: string
}

const ApplicationsErrorState = ({
   onRetry,
   message = "Failed to load your applications."
}: ApplicationsErrorStateProps) => {
   return (
      <Box className="flex min-h-125 items-center justify-center bg-[#FAFBFF] p-6">
         <Box className="max-w-md text-center">
            <Alert severity="error">{message}</Alert>

            <Button
               className="mt-4! normal-case!"
               variant="contained"
               onClick={onRetry}>
               Try Again
            </Button>
         </Box>
      </Box>
   )
}

export default ApplicationsErrorState
