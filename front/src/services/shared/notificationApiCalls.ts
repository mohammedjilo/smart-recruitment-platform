import type {
   GetNotificationsResult,
   NotificationActionResult,
   NotificationType
} from "@/types/api/notifications"
import { smartApi } from "@/services/api/baseApi"

type GetNotificationsQueryParams = {
   page?: number
   type?: NotificationType | "ALL"
}

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      getNotifications: builder.query<
         GetNotificationsResult,
         GetNotificationsQueryParams | void
      >({
         query: (args = {}) => {
            const { page = 1, type } = args as GetNotificationsQueryParams

            return {
               url: "/api/notification",
               params: {
                  page,
                  ...(type && type !== "ALL" ? { type } : {})
               }
            }
         },
         providesTags: result => [
            { type: "Notifications", id: "PARTIAL-LIST" },
            { type: "Notifications", id: "READ-STATE" },
            ...(result?.data.map(({ id }) => ({ type: "Notifications" as const, id })) ??
               [])
         ]
      }),
      markNotificationAsRead: builder.mutation<NotificationActionResult, string>({
         query: notificationId => ({
            url: `/api/notification/${notificationId}/read`,
            method: "PATCH"
         }),
         invalidatesTags: (_result, _error, notificationId) => [
            { type: "Notifications", id: notificationId }
         ]
      }),
      markAllNotificationsAsRead: builder.mutation<NotificationActionResult, void>({
         query: () => ({
            url: "/api/notification/read-all",
            method: "PATCH"
         }),
         invalidatesTags: [{ type: "Notifications", id: "READ-STATE" }]
      }),
      deleteNotification: builder.mutation<NotificationActionResult, string>({
         query: notificationId => ({
            url: `/api/notification/${notificationId}`,
            method: "DELETE"
         }),
         invalidatesTags: [{ type: "Notifications", id: "PARTIAL-LIST" }]
      })
   })
})

export const {
   useGetNotificationsQuery,
   useMarkNotificationAsReadMutation,
   useMarkAllNotificationsAsReadMutation,
   useDeleteNotificationMutation
} = extendedSmartApi
export { extendedSmartApi as smartApi }
