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
            className="border-border bg-surface w-full max-w-lg rounded-xl border p-6 shadow-sm sm:p-8"
            elevation={0}>
            <Typography
               className="text-content font-bold"
               component="h1"
               variant="h5">
               Contact Support
            </Typography>
            <Typography className="text-muted mt-2 text-sm leading-6">
               Verify the credentials for your deactivated account to access its support
               requests.
            </Typography>
            {error && (
               <Alert
                  className="mt-5"
                  role="alert"
                  severity="error">
                  {error}
               </Alert>
            )}
            <Box
               className="mt-5 space-y-4"
               component="form"
               onSubmit={event => void submit(event)}>
               <FormControl>
                  <FormLabel>Account type</FormLabel>
                  <RadioGroup
                     value={role}
                     row
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
                  id="support-account-email"
                  type="email"
                  required
                  value={email}
                  autoComplete="username"
                  fullWidth
                  label="Account email"
                  onChange={event => setEmail(event.target.value)}
               />
               <TextField
                  className="mt-3!"
                  id="support-account-password"
                  type="password"
                  required
                  value={password}
                  autoComplete="current-password"
                  fullWidth
                  label="Password"
                  onChange={event => setPassword(event.target.value)}
               />
               <Button
                  className="mt-3!"
                  type="submit"
                  disabled={isSubmitting}
                  fullWidth
                  variant="contained">
                  {isSubmitting ? "Verifying..." : "Verify and continue"}
               </Button>
            </Box>
            <Button
               className="mt-3! normal-case!"
               component={Link}
               to="/login"
               variant="text">
               Back to Login
            </Button>
         </Paper>
      </Box>
   )
}
