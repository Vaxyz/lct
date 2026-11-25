import { baseApi } from '../../app/baseApi'

export type LoginRequest = { email: string; password: string }
export type RegisterRequest = { firstName: string; lastName: string; email: string; password: string }
export type AuthUser = {
  accessToken: string
  tokenType: string
  userId: string
  email: string
  firstName: string
  roles: string[]
  permissions: string[]
}
export type CurrentUser = Omit<AuthUser, 'accessToken' | 'tokenType'> & { lastName: string }
export type ApiResponse<T> = { success: boolean; message: string; data: T; timestamp: string }

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthUser>, LoginRequest>({
      query: (body) => ({ url: '/v1/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<ApiResponse<AuthUser>, RegisterRequest>({
      query: (body) => ({ url: '/v1/auth/register', method: 'POST', body }),
    }),
    me: builder.query<ApiResponse<CurrentUser>, void>({
      query: () => '/v1/auth/me',
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation, useMeQuery } = authApi
