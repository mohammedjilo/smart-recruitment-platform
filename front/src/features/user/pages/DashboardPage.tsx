import { Box, Button, Card, Skeleton, Typography } from "@mui/material"
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined"
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined"
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined"
import { useGetDashboardDataQuery } from "@/features/user/services/userApiCalls"
import { Link } from "react-router-dom"
import RecommendedJobItem from "@/features/user/components/dashboard/RecommendedJobItem"
import RecentApplicationItem from "@/features/user/components/dashboard/RecentApplicationItem"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import PageHeader from "@/features/user/components/PageHeader"

const DashboardPage = () => {
   const query = useGetDashboardDataQuery()
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const dashboard = response?.data
   const isLoading = queryPresentation.category === "loading"
   const pageHeader = (
      <PageHeader
         title="Dashboard"
         description="Your activity and opportunities at a glance."
      />
   )

   if (isLoading) {
      return (
         <Box className="flex flex-col gap-4">
            {pageHeader}
            <Box className="grid grid-cols-3 gap-4">
               {Array.from({ length: 3 }).map((_, index) => (
                  <Card
                     key={index}
                     className="col-span-1 flex items-center px-2 py-4">
                     <Skeleton
                        variant="rounded"
                        width={56}
                        height={56}
                     />
                     <Box className="ml-4 flex flex-col gap-2">
                        <Skeleton
                           variant="text"
                           width={70}
                           height={32}
                        />
                        <Skeleton
                           variant="text"
                           width={100}
                           height={20}
                        />
                     </Box>
                  </Card>
               ))}
            </Box>

            <Box className="my-2 flex justify-between">
               <Skeleton
                  variant="text"
                  width={180}
                  height={28}
               />
               <Skeleton
                  variant="text"
                  width={90}
                  height={24}
               />
            </Box>

            <Box className="grid grid-cols-3 gap-4">
               {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                     key={index}
                     variant="rounded"
                     height={180}
                  />
               ))}
            </Box>

            <Box className="my-2 flex justify-between">
               <Skeleton
                  variant="text"
                  width={170}
                  height={28}
               />
               <Skeleton
                  variant="text"
                  width={90}
                  height={24}
               />
            </Box>

            <Box className="flex flex-col gap-3">
               {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                     key={index}
                     variant="rounded"
                     height={80}
                  />
               ))}
            </Box>
         </Box>
      )
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex flex-col">
            {pageHeader}
            <Box className="flex min-h-100 flex-col items-center justify-center gap-3">
               <Typography className="text-sm! text-red-600!" role="alert" aria-live="assertive">
                  {queryPresentation.message}
               </Typography>
               <Button onClick={query.refetch} className="normal-case!">
                  Retry
               </Button>
            </Box>
         </Box>
      )
   }

   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }
   if (!dashboard) {
      return (
         <Box>
            {pageHeader}
            <Box className="py-10 text-center">
               <Typography className="text-sm! text-muted!">
                  Dashboard data could not be determined.
               </Typography>
            </Box>
         </Box>
      )
   }

   const { stats, recommendedJobs, recentApplications } = dashboard

   return (
      <Box className="flex flex-col">
         {pageHeader}
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
         <Box className="grid grid-cols-3 gap-4">
            <Card className="col-span-1 flex items-center px-2 py-4">
               <BusinessCenterOutlinedIcon className="text-primary! bg-primary-tint! rounded-xl p-2 text-5xl!" />
               <Box className="ml-4 flex flex-col">
                  <Typography className="text-xl! font-semibold!">
                     {stats.applications}
                  </Typography>
                  <Typography
                     className="text-xs!"
                     color="textSecondary">
                     Applications
                  </Typography>
               </Box>
            </Card>

            <Card className="col-span-1 flex items-center px-2 py-4">
               <BookmarkBorderOutlinedIcon className="bg-primary-tint! rounded-xl p-2 text-5xl!" />
               <Box className="ml-4 flex flex-col">
                  <Typography className="text-xl! font-semibold!">
                     {stats.savedJobs}
                  </Typography>
                  <Typography
                     className="text-xs!"
                     color="textSecondary">
                     Saved Jobs
                  </Typography>
               </Box>
            </Card>

            <Card className="col-span-1 flex items-center px-2 py-4">
               <NotificationsNoneOutlinedIcon className="rounded-xl bg-orange-100! p-2 text-5xl! text-orange-300!" />
               <Box className="ml-4 flex flex-col">
                  <Typography className="text-xl! font-semibold!">
                     {stats.notificationsCount}
                  </Typography>
                  <Typography
                     className="text-xs!"
                     color="textSecondary">
                     Notifications
                  </Typography>
               </Box>
            </Card>
         </Box>

         <Box className="my-2 flex justify-between">
            <Typography>Recommended For You</Typography>
            <Typography>
               <Link
                  to={`/jobs`}
                  className="text-primary hover:text-primary-dark underline">
                  View All
               </Link>
            </Typography>
         </Box>

         <Box className="grid grid-cols-3 gap-4">
            {recommendedJobs.map(job => (
               <RecommendedJobItem
                  key={job.id}
                  job={job}
               />
            ))}
         </Box>

         <Box className="my-2 flex justify-between">
            <Typography>Recent Applications</Typography>
            <Typography>
               <Link
                  to={`/applications`}
                  className="text-primary hover:text-primary-dark underline">
                  View All
               </Link>
            </Typography>
         </Box>

         <Box>
            <Box className="flex flex-col">
               {recentApplications.map(application => {
                  return (
                     <RecentApplicationItem
                        key={application.id}
                        application={application}
                     />
                  )
               })}
            </Box>
         </Box>
      </Box>
   )
}

export default DashboardPage
