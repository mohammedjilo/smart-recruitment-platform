import { useState, type FormEvent } from "react"
import {
   Alert,
   Box,
   Button,
   FormControl,
   FormControlLabel,
   FormLabel,
   Paper,
   Radio,
   RadioGroup,
   TextField,
   Typography
} from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import { loginSchema, type LoginFormValues } from "@/schema/auth"
import { verifySupportOnlyCredentials } from "@/services/api/supportOnlyApi"

export default function SupportOnlyAccessPage() {
   const navigate = useNavigate()
   const [role, setRole] = useState<LoginFormValues["role"]>("user")
   const [email, setEmail] = useState("")
   const [password, setPassword] = useState("")
   const [error, setError] = useState("")
   const [isSubmitting, setIsSubmitting] = useState(false)

   const submit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError("")
      const parsed = loginSchema.safeParse({ role, email, password })
      if (!parsed.success) {
         setError(parsed.error.issues[0]?.message ?? "Enter your account credentials.")
         return
      }

      setIsSubmitting(true)
      try {
         const result = await verifySupportOnlyCredentials(parsed.data)
         setPassword("")
         if (result.data.mode === "active") {
            navigate("/login", { replace: true })
            return
         }
         navigate("/support-only", { replace: true })
      } catch (requestError) {
         setPassword("")
         setError(
            requestError instanceof Error
               ? requestError.message
               : "Credentials could not be verified."
         )
      } finally {
         setIsSubmitting(false)
      }
   }

   return (
      <Box className="bg-bg flex min-h-screen items-center justify-center px-4 py-10">
         <Paper
            elevation={0}
            className="border-border bg-surface w-full max-w-lg rounded-xl border p-6 shadow-sm sm:p-8">
            <Typography
               component="h1"
               variant="h5"
               className="text-content font-bold">
               Contact Support
            </Typography>
            <Typography className="text-muted mt-2 text-sm leading-6">
               Verify the credentials for your deactivated account to access its support
               requests.
            </Typography>
            {error && (
               <Alert
                  severity="error"
                  role="alert"
                  className="mt-5">
                  {error}
               </Alert>
            )}
            <Box
               component="form"
               onSubmit={event => void submit(event)}
               className="mt-5 space-y-4">
               <FormControl>
                  <FormLabel>Account type</FormLabel>
                  <RadioGroup
                     row
                     value={role}
                     onChange={event =>
                        setRole(event.target.value as LoginFormValues["role"])
                     }>
                     <FormControlLabel
                        value="user"
                        control={<Radio />}
                        label="User"
                     />
                     <FormControlLabel
                        value="company"
                        control={<Radio />}
                        label="Company"
                     />
                  </RadioGroup>
               </FormControl>
               <TextField
                  className="mt-3!"
                  fullWidth
                  required
                  id="support-account-email"
                  type="email"
                  autoComplete="username"
                  label="Account email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
               />
               <TextField
                  className="mt-3!"
                  fullWidth
                  required
                  id="support-account-password"
                  type="password"
                  autoComplete="current-password"
                  label="Password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
               />
               <Button
                  className="mt-3!"
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting}>
                  {isSubmitting ? "Verifying..." : "Verify and continue"}
               </Button>
            </Box>
            <Button
               component={Link}
               to="/login"
               variant="text"
               className="mt-3! normal-case!">
               Back to Login
            </Button>
         </Paper>
      </Box>
   )
}
