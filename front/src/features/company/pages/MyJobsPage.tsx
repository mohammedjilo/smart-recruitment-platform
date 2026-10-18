import { useNavigate, useSearchParams } from "react-router-dom"
import AddIcon from "@mui/icons-material/Add"
import { useGetCompanyJobsQuery } from "@/features/company/services/companyApiCalls"
import type { EmploymentType, JobStatus } from "@/types/createJob.types"
import PaginationFooter from "@/components/common/PaginationFooter"
import JobStats from "@/features/company/components/MyJobs/JobStats"
import JobFilters from "@/features/company/components/MyJobs/JobFilters"
import JobsTable from "@/features/company/components/MyJobs/JobsTable"
import PageHeader from "@/components/common/PageHeader"
import { Alert, Box, Button, Skeleton } from "@mui/material"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const PAGE_SIZE = 6

const MyJobsPage = () => {
   const [searchParams, setSearchParams] = useSearchParams()
   const page = Number(searchParams.get("page")) || 1
   const navigate = useNavigate()
   const updateParams = (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams)

      Object.entries(updates).forEach(([key, value]) => {
         if (value) {
            params.set(key, value)
         } else {
            params.delete(key)
         }
      })

      setSearchParams(params)
   }

   const search = searchParams.get("search") ?? ""
   const status = (searchParams.get("status") as JobStatus | null) ?? "ALL"
   const employmentType =
      (searchParams.get("employmentType") as EmploymentType | null) ?? "ALL"
   const sort = (searchParams.get("sort") as "newest" | "oldest" | null) ?? "newest"

   const setPage = (newPage: number) => {
      updateParams({ page: String(newPage) })
   }

   const query = useGetCompanyJobsQuery({
      pageNumber: page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status: status === "ALL" ? undefined : status,
      employmentType: employmentType === "ALL" ? undefined : employmentType,
      sortBy: "createdAt",
      sortOrder: sort === "newest" ? "desc" : "asc"
   })
   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0,
      noResults: page > 1 && (query.currentData?.meta?.totalCount ?? 0) > 0
   })
   const queryPresentation = getQueryPresentation(queryState, "page")
   const jobsResponse = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   const jobs = jobsResponse?.data ?? []

   const totalCount = jobsResponse?.meta?.totalCount ?? 0

   const stats = jobsResponse
      ? {
           all: jobsResponse.stats.totalJobs,
           open: jobsResponse.stats.open,
           draft: jobsResponse.stats.draft,
           closed: jobsResponse.stats.closed,
           expired: jobsResponse.stats.expired
        }
      : undefined

   const handleSearchChange = (value: string) => {
      updateParams({ search: value || undefined, page: "1" })
   }

   const handleStatusChange = (value: JobStatus | "ALL") => {
      updateParams({ status: value === "ALL" ? undefined : value, page: "1" })
   }

   const handleEmploymentTypeChange = (value: EmploymentType | "ALL") => {
      updateParams({
         employmentType: value === "ALL" ? undefined : value,
         page: "1"
      })
   }

   const handleSortChange = (value: "newest" | "oldest") => {
      updateParams({ sort: value === "newest" ? undefined : value, page: "1" })
   }

   return (
      <Box className="min-h-screen">
         <PageHeader
            title="My Jobs"
            description="Manage and track all jobs posted by your company."
            actions={
               <Button
                  className="app-button-primary flex! items-center! gap-2! rounded-lg! px-5! py-3! text-sm! font-semibold! capitalize! shadow-sm! transition! active:scale-[0.98]!"
                  onClick={() => navigate("/create-job")}>
                  <AddIcon fontSize="small" />
                  Create New Job
               </Button>
            }
         />

         {/* Stats */}
         {isLoading ? (
            <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
               {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                     key={index}
                     variant="rounded"
                     height={124}
                  />
               ))}
            </Box>
         ) : stats ? (
            <JobStats stats={stats} />
         ) : queryPresentation.category === "page_error" ||
           queryPresentation.category === "authentication_notice" ||
           queryPresentation.category === "access_denied" ||
           queryPresentation.category === "resource_not_found" ? (
            <Alert
               severity="error"
               role="alert"
               aria-live="assertive"
               action={
                  <Button
                     color="inherit"
                     size="small"
                     onClick={() => void query.refetch()}>
                     Retry
                  </Button>
               }>
               {queryPresentation.message}
            </Alert>
         ) : null}
         {queryPresentation.category === "stale_error" && (
            <Alert
               severity="warning"
               role="status"
               aria-live="polite"
               action={
                  <Button
                     color="inherit"
                     size="small"
                     onClick={() => void query.refetch()}>
                     Retry
                  </Button>
               }>
               {queryPresentation.message}
            </Alert>
         )}

         {/* Filters */}
         <Box className="mt-6">
            {isLoading ? (
               <FiltersBarSkeleton
                  responsiveAt="xl"
                  fields={["search", "control", "control", "control"]}
               />
            ) : (
               <JobFilters
                  search={search}
                  status={status}
                  employmentType={employmentType}
                  sort={sort}
                  onSearchChange={handleSearchChange}
                  onStatusChange={handleStatusChange}
                  onEmploymentTypeChange={handleEmploymentTypeChange}
                  onSortChange={handleSortChange}
               />
            )}
         </Box>

         {/* Table */}
         <Box className="mt-6">
            <JobsTable
               jobs={jobs}
               isLoading={isLoading}
               isFetching={queryPresentation.category === "refreshing"}
               queryState={queryState}
               onRetry={query.refetch}
            />
         </Box>

         {/* Pagination */}
         {totalCount && (
            <PaginationFooter
               page={page}
               totalCount={totalCount}
               pageSize={PAGE_SIZE}
               setPage={setPage}
               itemLabel="jobs"
               isFetching={queryPresentation.category === "refreshing"}
               queryState={queryState}
            />
         )}
      </Box>
   )
}

export default MyJobsPage
