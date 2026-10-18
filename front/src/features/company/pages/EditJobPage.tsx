import React from "react"
import { useParams, useSearchParams } from "react-router-dom"
import JobForm from "@/features/company/components/JobForm/JobForm"
import { useGetCompanyJobByIdQuery } from "@/features/company/services/companyApiCalls"
import { mapCompanyJobToFormData } from "@/features/company/components/JobForm/types"
import { CompanyDetailsSkeleton } from "@/features/company/components/CompanySkeletons"
import { Box, Button, Typography } from "@mui/material"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const EditJobPage: React.FC = () => {
   const { id, slug } = useParams<{ id: string; slug: string }>()
   const [searchParams] = useSearchParams()
   const initialStep = searchParams.get("step") === "questions" ? 2 : 1
   const hasRouteParams = Boolean(id && slug)
   const query = useGetCompanyJobByIdQuery(
      { id: id ?? "", slug: slug ?? "" },
      {
         skip: !hasRouteParams,
         refetchOnMountOrArgChange: true
      }
   )
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   if (!hasRouteParams) {
      return (
         <div className="text-sm text-red-500">
            Unable to load this job. Please check the URL and try again.
         </div>
      )
   }

   if (isLoading) {
      return <CompanyDetailsSkeleton />
   }
   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-80 flex-col items-center justify-center gap-3">
            <Typography className="text-sm! text-red-600!" role="alert" aria-live="assertive">
               {queryPresentation.message}
            </Typography>
            <Button onClick={query.refetch} className="normal-case!">
               Retry
            </Button>
         </Box>
      )
   }
   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }
   if (!response?.data) {
      return (
         <Box className="py-10 text-center text-sm text-muted">
            Job data could not be determined.
         </Box>
      )
   }

   return (
      <>
         {queryPresentation.category === "stale_error" && (
            <Box className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" role="status" aria-live="polite">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button onClick={query.refetch} className="normal-case!">
                  Retry
               </Button>
            </Box>
         )}
         <JobForm
            mode="edit"
            jobId={id}
            initialStep={initialStep}
            initialData={mapCompanyJobToFormData(response.data)}
         />
      </>
   )
}

export default EditJobPage
