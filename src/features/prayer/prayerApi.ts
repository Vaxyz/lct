import { baseApi } from '../../app/baseApi'

export type PrayerRequest = {
  id: string
  requesterName: string
  content: string
  status: 'NEW' | 'IN_PRAYER' | 'ANSWERED' | 'ARCHIVED'
  visibility: 'PRIVATE' | 'PUBLIC'
  anonymous: boolean
  prayerCount: number
  adminNote?: string | null
  createdAt: string
  answeredAt?: string | null
}
export type PrayerCreate = { name?: string; email?: string; content: string; visibility: 'PRIVATE' | 'PUBLIC'; anonymous: boolean }
export type PrayerStatusUpdate = { status: PrayerRequest['status']; adminNote?: string }
export type ApiResponse<T> = { success: boolean; message: string; data: T; timestamp: string }

export const prayerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicPrayerRequests: builder.query<ApiResponse<PrayerRequest[]>, void>({ query: () => '/v1/prayer/public', providesTags: ['Prayer'] }),
    getMyPrayerRequests: builder.query<ApiResponse<PrayerRequest[]>, void>({ query: () => '/v1/prayer/mine', providesTags: ['Prayer'] }),
    getAdminPrayerRequests: builder.query<ApiResponse<PrayerRequest[]>, void>({ query: () => '/v1/prayer/admin', providesTags: ['Prayer'] }),
    submitPrayerRequest: builder.mutation<ApiResponse<PrayerRequest>, PrayerCreate>({ query: (body) => ({ url: '/v1/prayer/requests', method: 'POST', body }), invalidatesTags: ['Prayer'] }),
    prayForRequest: builder.mutation<ApiResponse<PrayerRequest>, string>({ query: (id) => ({ url: `/v1/prayer/${id}/pray`, method: 'POST' }), invalidatesTags: ['Prayer'] }),
    updatePrayerRequest: builder.mutation<ApiResponse<PrayerRequest>, { id: string; body: PrayerStatusUpdate }>({ query: ({ id, body }) => ({ url: `/v1/prayer/admin/${id}`, method: 'PATCH', body }), invalidatesTags: ['Prayer'] }),
  }),
})

export const { useGetPublicPrayerRequestsQuery, useGetMyPrayerRequestsQuery, useGetAdminPrayerRequestsQuery, useSubmitPrayerRequestMutation, usePrayForRequestMutation, useUpdatePrayerRequestMutation } = prayerApi
