"use client"

import { useState } from "react"

import { Box, Typography } from "@mui/material"
import PaginationFooter from "@/components/common/PaginationFooter"
import { useGetNotificationsQuery } from "@/services/shared/notificationApiCalls"
import type { NotificationType } from "@/types/notification"
import NotificationsToolbar from "../components/notifications/NotificationsToolbar"
import NotificationsList from "../components/notifications/NotificationsList"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"

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
            minHeight: "100%",
            px: {
               xs: 2,
               sm: 3,
               md: 4
            },
            py: {
               xs: 2.5,
               sm: 3,
               md: 4
            }
         }}>
         {/* Page Header */}
         <Box
            sx={{
               mb: 3
            }}>
            <Typography
               sx={{
                  fontSize: {
                     xs: 24,
                     sm: 28
                  },
                  lineHeight: 1.2,
                  fontWeight: 700,
                  color: "#0F2342"
               }}>
               NotificationsPage
            </Typography>

            <Typography
               sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "#7185A3"
               }}>
               Stay updated with your latest activity and important events.
            </Typography>
         </Box>

         {/* Toolbar */}
         {isLoading ? (
            <FiltersBarSkeleton pillCount={8} />
         ) : (
            <NotificationsToolbar
               filter={filter}
               onFilterChange={handleFilterChange}
            />
         )}

         {/* NotificationsPage */}
         <Box className="mt-6">
            <NotificationsList
               notifications={notifications}
               isLoading={isLoading}
               isFetching={isFetching}
            />
         </Box>

         {/* Pagination */}
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
