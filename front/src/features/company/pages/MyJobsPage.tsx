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
            actions={
               <Button
                  className="flex! items-center! gap-2! rounded-lg! px-5! py-3! text-sm! font-semibold! capitalize! shadow-sm! transition! active:scale-[0.98]!"
                  variant="contained"
                  onClick={() => navigate("/create-job")}>
                  <AddIcon fontSize="small" />
                  Create New Job
               </Button>
            }
            description="Manage and track all jobs posted by your company."
            title="My Jobs"
         />

         {/* Stats */}
         {isLoading ? (
            <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
               {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                     key={index}
                     height={124}
                     variant="rounded"
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
               aria-live="assertive"
               action={
                  <Button
                     color="inherit"
                     size="small"
                     onClick={() => void query.refetch()}>
                     Retry
                  </Button>
               }
               role="alert"
               severity="error">
               {queryPresentation.message}
            </Alert>
         ) : null}
         {queryPresentation.category === "stale_error" && (
            <Alert
               aria-live="polite"
               action={
                  <Button
                     color="inherit"
                     size="small"
                     onClick={() => void query.refetch()}>
                     Retry
                  </Button>
               }
               role="status"
               severity="warning">
               {queryPresentation.message}
            </Alert>
         )}

         {/* Filters */}
         <Box className="mt-6">
            {isLoading ? (
               <FiltersBarSkeleton
                  fields={["search", "control", "control", "control"]}
                  responsiveAt="xl"
               />
            ) : (
               <JobFilters
                  employmentType={employmentType}
                  search={search}
                  sort={sort}
                  status={status}
                  onEmploymentTypeChange={handleEmploymentTypeChange}
                  onSearchChange={handleSearchChange}
                  onSortChange={handleSortChange}
                  onStatusChange={handleStatusChange}
               />
            )}
         </Box>

         {/* Table */}
         <Box className="mt-6">
            <JobsTable
               isFetching={queryPresentation.category === "refreshing"}
               isLoading={isLoading}
               jobs={jobs}
               queryState={queryState}
               onRetry={query.refetch}
            />
         </Box>

         {/* Pagination */}
         {totalCount && (
            <PaginationFooter
               isFetching={queryPresentation.category === "refreshing"}
               itemLabel="jobs"
               page={page}
               pageSize={PAGE_SIZE}
               queryState={queryState}
               setPage={setPage}
               totalCount={totalCount}
            />
         )}
      </Box>
   )
}

export default MyJobsPage
