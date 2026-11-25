import { baseApi } from '../../app/baseApi'

export type Profile = { firstName: string; lastName: string; email: string; roles: string[] }
export type UserSummary = { userId: string; firstName: string; lastName: string; email: string; enabled: boolean; roles: string[]; createdAt: string }
type ApiResponse<T> = { success: boolean; message: string; data: T }

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    profile: builder.query<ApiResponse<Profile>, void>({ query: () => '/v1/users/me/profile', providesTags: ['Profile'] }),
    updateProfile: builder.mutation<ApiResponse<Profile>, Pick<Profile, 'firstName' | 'lastName' | 'email'>>({ query: (body) => ({ url: '/v1/users/me/profile', method: 'PUT', body }), invalidatesTags: ['Profile'] }),
    adminUsers: builder.query<ApiResponse<UserSummary[]>, string>({ query: (search) => ({ url: '/v1/admin/users', params: search.trim() ? { search: search.trim() } : {} }), providesTags: ['AdminUsers'] }),
    availableRoles: builder.query<ApiResponse<string[]>, void>({ query: () => '/v1/admin/users/roles' }),
    assignRoles: builder.mutation<ApiResponse<UserSummary>, { userId: string; roles: string[] }>({ query: ({ userId, roles }) => ({ url: `/v1/admin/users/${userId}/roles`, method: 'PUT', body: { roles } }), invalidatesTags: ['AdminUsers'] }),
  }),
})

export const { useProfileQuery, useUpdateProfileMutation, useAdminUsersQuery, useAvailableRolesQuery, useAssignRolesMutation } = usersApi
