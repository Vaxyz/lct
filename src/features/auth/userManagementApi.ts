import { baseApi } from "../../app/baseApi";

export type Profile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  profilePhotoUrl: string | null;
};
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};
export type UpdatedAuthUser = {
  accessToken: string;
  tokenType: string;
  userId: string;
  email: string;
  firstName: string;
  roles: string[];
  permissions: string[];
};
export type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  roles: string[];
};

export const userManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    myProfile: builder.query<ApiEnvelope<Profile>, void>({
      query: () => "/v1/users/me",
      providesTags: ["Users"],
    }),
    updateMyProfile: builder.mutation<
      ApiEnvelope<UpdatedAuthUser>,
      Pick<Profile, "firstName" | "lastName" | "email">
    >({
      query: (body) => ({ url: "/v1/users/me", method: "PUT", body }),
      invalidatesTags: ["Users"],
    }),
    uploadMyProfilePhoto: builder.mutation<ApiEnvelope<Profile>, FormData>({
      query: (body) => ({ url: "/v1/users/me/photo", method: "POST", body }),
      invalidatesTags: ["Users"],
    }),
    removeMyProfilePhoto: builder.mutation<ApiEnvelope<Profile>, void>({
      query: () => ({ url: "/v1/users/me/photo", method: "DELETE" }),
      invalidatesTags: ["Users"],
    }),
    adminUsers: builder.query<ApiEnvelope<AdminUser[]>, string>({
      query: (search) => ({
        url: "/v1/admin/users",
        params: search.trim() ? { search: search.trim() } : undefined,
      }),
      providesTags: ["Users"],
    }),
    adminRoles: builder.query<ApiEnvelope<string[]>, void>({
      query: () => "/v1/admin/users/roles",
    }),
    assignUserRole: builder.mutation<
      ApiEnvelope<AdminUser>,
      { userId: string; roleName: string }
    >({
      query: ({ userId, roleName }) => ({
        url: `/v1/admin/users/${userId}/role`,
        method: "PUT",
        body: { roleName },
      }),
      invalidatesTags: ["Users"],
    }),
    removeUserRole: builder.mutation<
      ApiEnvelope<AdminUser>,
      { userId: string; roleName: string }
    >({
      query: ({ userId, roleName }) => ({
        url: `/v1/admin/users/${userId}/roles/${encodeURIComponent(roleName)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useMyProfileQuery,
  useUpdateMyProfileMutation,
  useAdminUsersQuery,
  useAdminRolesQuery,
  useAssignUserRoleMutation,
  useRemoveUserRoleMutation,
  useUploadMyProfilePhotoMutation,
  useRemoveMyProfilePhotoMutation,
} = userManagementApi;
