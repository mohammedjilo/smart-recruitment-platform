"use client"

import { useState } from "react"

import { Box } from "@mui/material"
import {
   useMarkAllNotificationsAsReadMutation,
   useMarkNotificationAsReadMutation
} from "@/services/shared/notificationApiCalls"

import PaginationFooter from "@/components/common/PaginationFooter"
import { useGetNotificationsQuery } from "@/services/shared/notificationApiCalls"
import type { NotificationType } from "@/types/notification"
import NotificationsToolbar from "../components/notifications/NotificationsToolbar"
import NotificationsList from "../components/notifications/NotificationsList"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import PageHeader from "@/features/user/components/PageHeader"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { showAlert } from "@/utils/swal"

const ITEMS_PER_PAGE = 10

type NotificationFilter = "ALL" | NotificationType

const NotificationsPage = () => {
   const [page, setPage] = useState(1)
   const [filter, setFilter] = useState<NotificationFilter>("ALL")
   const [markNotificationAsRead, markResult] = useMarkNotificationAsReadMutation()
   const [markAllNotificationsAsRead, markAllResult] =
      useMarkAllNotificationsAsReadMutation()
   const markPresentation = getMutationPresentation(getMutationState(markResult), {
      surface: "action",
      importance: "routine"
   })
   const markAllPresentation = getMutationPresentation(
      getMutationState(markAllResult),
      { surface: "action", importance: "routine" }
   )
   const isMarkingAllAsRead = markAllPresentation.category === "loading"

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

   const handleMarkAsRead = async (notificationId: string) => {
      if (markPresentation.category === "loading") return
      try {
         await markNotificationAsRead(notificationId).unwrap()
      } catch (error) {
         const presentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "routine"
         })
         if (presentation.category !== "silent") {
            await showAlert({
               type: "error",
               title: "Could not update notification",
               text: presentation.message
            })
         }
      }
   }

   const handleMarkAllAsRead = async () => {
      if (isMarkingAllAsRead) return
      try {
         await markAllNotificationsAsRead().unwrap()
      } catch (error) {
         const presentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "routine"
         })
         if (presentation.category !== "silent") {
            await showAlert({
               type: "error",
               title: "Could not update notifications",
               text: presentation.message
            })
         }
      }
   }

   return (
      <Box className="min-h-full! w-full!">
         <PageHeader
            description="Stay updated with your latest activity and important events."
            title="Notifications"
         />

         {isLoading ? (
            <FiltersBarSkeleton pillCount={6} />
         ) : (
            <NotificationsToolbar
               filter={filter}
               isMarkingAllAsRead={isMarkingAllAsRead}
               onFilterChange={handleFilterChange}
               onMarkAllAsRead={() => void handleMarkAllAsRead()}
            />
         )}

         <Box className="mt-6">
            <NotificationsList
               isFetching={isFetching}
               isLoading={isLoading}
               notifications={notifications}
               onMarkAsRead={handleMarkAsRead}
            />
         </Box>

         {!isLoading && totalCount > 0 && (
            <PaginationFooter
               isFetching={isFetching}
               itemLabel="notifications"
               page={page}
               pageSize={ITEMS_PER_PAGE}
               setPage={setPage}
               totalCount={totalCount}
            />
         )}
      </Box>
   )
}

export default NotificationsPage
