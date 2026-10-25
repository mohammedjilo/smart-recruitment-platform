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
            { type: "Notifications", id: notificationId },
            { type: "Notifications", id: "READ-STATE" }
         ],
         async onQueryStarted(notificationId, { dispatch, getState, queryFulfilled }) {
            const cachedQueries = extendedSmartApi.util.selectInvalidatedBy(getState(), [
               { type: "Notifications", id: notificationId },
               { type: "Notifications", id: "READ-STATE" }
            ])
            const patches = cachedQueries.map(({ originalArgs }) =>
               dispatch(
                  extendedSmartApi.util.updateQueryData(
                     "getNotifications",
                     originalArgs as GetNotificationsQueryParams | void,
                     draft => {
                        for (const notification of draft.data) {
                           if (notification.id === notificationId) {
                              notification.isRead = true
                           }
                        }
                     }
                  )
               )
            )
            try {
               await queryFulfilled
            } catch {
               patches.forEach(patch => patch.undo())
            }
         }
      }),
      markAllNotificationsAsRead: builder.mutation<NotificationActionResult, void>({
         query: () => ({
            url: "/api/notification/read-all",
            method: "PATCH"
         }),
         invalidatesTags: [
            { type: "Notifications", id: "READ-STATE" },
            { type: "Notifications", id: "PARTIAL-LIST" }
         ],
         async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
            const cachedQueries = extendedSmartApi.util.selectInvalidatedBy(getState(), [
               { type: "Notifications", id: "READ-STATE" }
            ])
            const patches = cachedQueries.map(({ originalArgs }) =>
               dispatch(
                  extendedSmartApi.util.updateQueryData(
                     "getNotifications",
                     originalArgs as GetNotificationsQueryParams | void,
                     draft => {
                        for (const notification of draft.data) {
                           notification.isRead = true
                        }
                     }
                  )
               )
            )
            try {
               await queryFulfilled
            } catch {
               patches.forEach(patch => patch.undo())
            }
         }
      }),
   })
})

export const {
   useGetNotificationsQuery,
   useMarkNotificationAsReadMutation,
   useMarkAllNotificationsAsReadMutation
} = extendedSmartApi
export { extendedSmartApi as smartApi }
