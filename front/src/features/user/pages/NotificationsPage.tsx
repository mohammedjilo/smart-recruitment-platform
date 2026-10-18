"use client"

import { useState } from "react"

import { Box } from "@mui/material"

import PaginationFooter from "@/components/common/PaginationFooter"
import { useGetNotificationsQuery } from "@/services/shared/notificationApiCalls"
import type { NotificationType } from "@/types/notification"
import NotificationsToolbar from "../components/notifications/NotificationsToolbar"
import NotificationsList from "../components/notifications/NotificationsList"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import PageHeader from "@/features/user/components/PageHeader"

const ITEMS_PER_PAGE = 10

type NotificationFilter = "ALL" | NotificationType

const NotificationsPage = () => {
   const [page, setPage] = useState(1)
   const [filter, setFilter] = useState<NotificationFilter>("ALL")

   const { data, isLoading, isFetching } = useGetNotificationsQuery({
      page,
      type: filter === "ALL" ? undefined : filter
   })

   const notifications = data?.data ?? []
   const totalCount = data?.meta?.totalCount ?? notifications.length

   const handleFilterChange = (value: NotificationFilter) => {
      setFilter(value)
      setPage(1)
   }

   return (
      <Box
         sx={{
            width: "100%",
            minHeight: "100%"
         }}>
         <PageHeader
            title="Notifications"
            description="Stay updated with your latest activity and important events."
         />

         {isLoading ? (
            <FiltersBarSkeleton pillCount={6} />
         ) : (
            <NotificationsToolbar
               filter={filter}
               onFilterChange={handleFilterChange}
            />
         )}

         <Box className="mt-6">
            <NotificationsList
               notifications={notifications}
               isLoading={isLoading}
               isFetching={isFetching}
            />
         </Box>

         {!isLoading && totalCount > 0 && (
            <PaginationFooter
               page={page}
               pageSize={ITEMS_PER_PAGE}
               totalCount={totalCount}
               setPage={setPage}
               itemLabel="notifications"
               isFetching={isFetching}
            />
         )}
      </Box>
   )
}

export default NotificationsPage
