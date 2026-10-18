import { Alert, Box, Button, Chip, Typography } from "@mui/material"
import { Link, Navigate } from "react-router-dom"
import CustomCard from "@/components/common/CustomCard"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"

type CompanyRegistrationStatusPageProps = {
   status: "PENDING" | "REJECTED"
}

const formatDate = (value?: string | null) => {
   if (!value) return null
   const date = new Date(value)
   return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString()
}

export default function CompanyRegistrationStatusPage({
   status
}: CompanyRegistrationStatusPageProps) {
   const review = useSelector(
      (state: RootState) => state.auth.companyRegistrationReview
   )

   if (review && review.registrationStatus !== status) {
      return (
         <Navigate
            to={
               review.registrationStatus === "PENDING"
                  ? "/company/registration/pending"
                  : "/company/registration/rejected"
            }
            replace
         />
      )
   }

   const company = review?.company
   const isPending = status === "PENDING"
   const relevantDate = formatDate(
      isPending ? company?.submittedAt : company?.reviewedAt
   )

   return (
      <Box className="flex min-h-screen items-center justify-center px-4 py-8">
         <CustomCard>
            <Box className="space-y-5">
               <Box className="space-y-2">
                  <Typography variant="h4" component="h1" className="font-bold!">
                     {isPending
                        ? "Registration Under Review"
                        : "Registration Rejected"}
                  </Typography>
                  <Typography color="text.secondary">
                     {isPending
                        ? "Your company registration has been submitted successfully and is currently being reviewed by our administration team."
                        : "Your company registration was rejected. Review the feedback below, update your information, and submit it for review again."}
                  </Typography>
               </Box>

               <Box className="flex flex-wrap items-center gap-3">
                  <Typography className="font-semibold!">
                     Current status:
                  </Typography>
                  <Chip
                     label={isPending ? "Pending Review" : "Registration Rejected"}
                     color={isPending ? "warning" : "error"}
                  />
                  {relevantDate && (
                     <Typography color="text.secondary">
                        {isPending ? "Submitted" : "Reviewed"} {relevantDate}
                     </Typography>
                  )}
               </Box>

               {isPending ? (
                  <Alert severity="info">
                     Your company cannot access the normal dashboard until it has
                     been approved.
                  </Alert>
               ) : (
                  <Alert severity="error">
                     {company?.rejectionReason ||
                        "No additional rejection reason was provided. You can review your company details and resubmit them."}
                  </Alert>
               )}

               <Box className="flex flex-wrap gap-3">
                  {isPending ? (
                     <Button
                        component={Link}
                        to="/login"
                        variant="contained">
                        Back to Login
                     </Button>
                  ) : (
                     <Button
                        component={Link}
                        to="/register/company"
                        variant="contained">
                        Review & Resubmit
                     </Button>
                  )}
                  {!isPending && (
                     <Button
                        component={Link}
                        to="/login"
                        variant="outlined">
                        Back to Login
                     </Button>
                  )}
               </Box>
            </Box>
         </CustomCard>
      </Box>
   )
}
