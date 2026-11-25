import { baseApi } from '../../app/baseApi'
export type NotificationItem = { id:string; type:string; title:string; message:string; link?:string|null; read:boolean; emailStatus:'PENDING'|'SENT'|'FAILED'|'DISABLED'; createdAt:string }
type ApiResponse<T>={success:boolean;message:string;data:T;timestamp:string}
export const notificationsApi=baseApi.injectEndpoints({endpoints:(builder)=>({
 getNotifications:builder.query<ApiResponse<NotificationItem[]>,void>({query:()=>'/v1/notifications',providesTags:['Notifications']}),
 getUnreadNotificationCount:builder.query<ApiResponse<number>,void>({query:()=>'/v1/notifications/unread-count',providesTags:['Notifications']}),
 markNotificationRead:builder.mutation<ApiResponse<null>,string>({query:id=>({url:`/v1/notifications/${id}/read`,method:'POST'}),invalidatesTags:['Notifications']}),
 markAllNotificationsRead:builder.mutation<ApiResponse<null>,void>({query:()=>({url:'/v1/notifications/read-all',method:'POST'}),invalidatesTags:['Notifications']}),
 sendTestNotification:builder.mutation<ApiResponse<null>,void>({query:()=>({url:'/v1/notifications/test',method:'POST'}),invalidatesTags:['Notifications']}),
})})
export const {useGetNotificationsQuery,useGetUnreadNotificationCountQuery,useMarkNotificationReadMutation,useMarkAllNotificationsReadMutation,useSendTestNotificationMutation}=notificationsApi

export type NotificationCategory = 'ANNOUNCEMENTS'|'EVENTS'|'DEVOTIONALS'|'BIBLE_STUDIES'|'PRAYER'|'GIVING'|'ACCOUNT'|'OTHER'
export type NotificationPreference = { category: NotificationCategory; inAppEnabled: boolean; emailEnabled: boolean }
export const notificationPreferencesApi = baseApi.injectEndpoints({ endpoints: (builder) => ({
 getNotificationPreferences: builder.query<ApiResponse<NotificationPreference[]>, void>({
  query: () => '/v1/notifications/preferences', providesTags: ['Notifications'],
 }),
 updateNotificationPreferences: builder.mutation<ApiResponse<NotificationPreference[]>, NotificationPreference[]>({
  query: (body) => ({ url: '/v1/notifications/preferences', method: 'PUT', body }), invalidatesTags: ['Notifications'],
 }),
}) })
export const { useGetNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } = notificationPreferencesApi
