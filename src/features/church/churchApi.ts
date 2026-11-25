import { baseApi } from '../../app/baseApi'

export type ChurchProfile = { name: string; tagline: string }
export type ApiResponse<T> = { success: boolean; message: string; data: T; timestamp: string }

export const churchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicChurch: builder.query<ApiResponse<ChurchProfile>, void>({
      query: () => '/v1/church/public',
      providesTags: ['Church'],
    }),
    getProtectedChurch: builder.query<ApiResponse<ChurchProfile>, void>({
      query: () => '/v1/church/profile',
      providesTags: ['Church'],
    }),
  }),
})

export const { useGetPublicChurchQuery, useGetProtectedChurchQuery } = churchApi
