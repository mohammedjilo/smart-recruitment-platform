import { useEffect } from "react"
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import {
   supportOnlyApi,
   useEndSupportAccessMutation,
   useGetSupportOnlySessionQuery
} from "@/services/api/supportOnlyApi"

export default function SupportOnlyLayout() {
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const session = useGetSupportOnlySessionQuery()
   const [endAccess, endState] = useEndSupportAccessMutation()

   useEffect(() => {
      if (
         session.error &&
         typeof session.error === "object" &&
         "status" in session.error &&
         (session.error.status === 401 || session.error.status === 403)
      ) {
         navigate("/support-access/verify", { replace: true })
      }
   }, [navigate, session.error])

   const logout = async () => {
      try {
         await endAccess().unwrap()
      } catch {
         // Clear local ticket data even if the session already expired.
      } finally {
         dispatch(supportOnlyApi.util.resetApiState())
         navigate("/account-deactivated", { replace: true })
      }
   }

   if (session.isLoading || session.isUninitialized) {
      return (
         <Box className="bg-bg flex min-h-screen items-center justify-center">
            <CircularProgress />
         </Box>
      )
   }

   if (session.isError) {
      return (
         <Box className="bg-bg flex min-h-screen items-center justify-center px-4">
            <Box className="bg-surface border-border w-full max-w-lg rounded-xl border p-6">
               <Alert severity="error">Support-only access could not be verified.</Alert>
               <Button
                  className="mt-3"
                  onClick={() => void session.refetch()}>
                  Try again
               </Button>
            </Box>
         </Box>
      )
   }

   return (
      <Box className="bg-bg min-h-screen">
         <header className="border-border bg-surface border-b">
            <Box className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
               <Box>
                  <Typography
                     className="text-content font-semibold"
                     component="h1">
                     Support access
                  </Typography>
                  <Typography className="text-muted text-xs">
                     Verified {session.data.data.accountType} account · limited access
                  </Typography>
               </Box>
               <Box className="flex items-center gap-3">
                  <Button
                     className="normal-case"
                     component={Link}
                     to="/support-only">
                     My requests
                  </Button>
                  <Button
                     className="normal-case"
                     disabled={endState.isLoading}
                     variant="outlined"
                     onClick={() => void logout()}>
                     {endState.isLoading ? "Signing out..." : "Log out"}
                  </Button>
               </Box>
            </Box>
         </header>
         <main className="mx-auto max-w-5xl px-4 py-8">
            <Outlet />
         </main>
      </Box>
   )
}
