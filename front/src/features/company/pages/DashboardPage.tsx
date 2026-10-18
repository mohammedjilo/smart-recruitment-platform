import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded"
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"

import { useGetDashboardComapnyQuery } from "@/features/company/services/companyApiCalls"
import StatCard from "@/features/company/components/dashboard/StatCard"
import RecentApplications from "@/features/company/components/dashboard/RecentApplications"
import RecentJobs from "@/features/company/components/dashboard/RecentJobs"
import TopJobs from "@/features/company/components/dashboard/TopJobs"
import { CompanyDashboardSkeleton } from "@/features/company/components/CompanySkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const DashboardPage = () => {
   const query = useGetDashboardComapnyQuery()
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   if (isLoading) {
      return <CompanyDashboardSkeleton />
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <div className="flex min-h-100 flex-col items-center justify-center">
            <p className="text-sm text-[#667085]" role="alert" aria-live="assertive">
               {queryPresentation.message}
            </p>

            <button
               onClick={query.refetch}
               className="app-button-primary mt-4 rounded-lg px-4 py-2 text-sm font-medium">
               Try Again
            </button>
         </div>
      )
   }

   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }

   const dashboard = response?.data

   if (!dashboard) {
      return (
         <div className="flex min-h-100 items-center justify-center text-sm text-[#667085]">
            Dashboard data could not be determined.
         </div>
      )
   }

   return (
      <div className="w-full">
         {queryPresentation.category === "stale_error" && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status" aria-live="polite">
               <span>{queryPresentation.message}</span>
               <button
                  onClick={query.refetch}
                  className="font-semibold">
                  Retry
               </button>
            </div>
         )}
         {/* ===================== */}
         {/* Stats */}
         {/* ===================== */}

         <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
               title="Active Jobs"
               value={dashboard.stats.activeJobs}
               description="Open positions"
               icon={<WorkOutlineRoundedIcon sx={{ fontSize: 28 }} />}
            />

            <StatCard
               title="Total Applications"
               value={dashboard.stats.totalApplications}
               description="All jobs"
               icon={<PeopleOutlineRoundedIcon sx={{ fontSize: 29 }} />}
            />

            <StatCard
               title="Interviews"
               value={dashboard.stats.interviews}
               description="Scheduled"
               icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 26 }} />}
            />
         </div>

         {/* ===================== */}
         {/* Applications + Jobs */}
         {/* ===================== */}

         <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
            <RecentApplications applications={dashboard.recentApplications} />

            <RecentJobs jobs={dashboard.recentJobs} />
         </div>

         {/* ===================== */}
         {/* Top Jobs */}
         {/* ===================== */}

         <div className="mt-5">
            <TopJobs jobs={dashboard.topJobs} />
         </div>
      </div>
   )
}

export default DashboardPage
