import { baseApi } from "../../app/baseApi";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};
export type ManagedRole = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  permissions: string[];
};

type CreateRoleInput = { name: string; description?: string };
type UpdatePermissionsInput = { roleId: string; permissions: string[] };

export const roleManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    managedRoles: builder.query<ApiEnvelope<ManagedRole[]>, void>({
      query: () => "/v1/admin/roles",
    }),
    availablePermissions: builder.query<ApiEnvelope<string[]>, void>({
      query: () => "/v1/admin/roles/permissions",
    }),
    createManagedRole: builder.mutation<
      ApiEnvelope<ManagedRole>,
      CreateRoleInput
    >({
      query: (body) => ({ url: "/v1/admin/roles", method: "POST", body }),
      invalidatesTags: ["Users"],
    }),
    updateRolePermissions: builder.mutation<
      ApiEnvelope<ManagedRole>,
      UpdatePermissionsInput
    >({
      query: ({ roleId, permissions }) => ({
        url: `/v1/admin/roles/${roleId}/permissions`,
        method: "PUT",
        body: { permissions },
      }),
    }),
  }),
});

export const {
  useManagedRolesQuery,
  useAvailablePermissionsQuery,
  useCreateManagedRoleMutation,
  useUpdateRolePermissionsMutation,
} = roleManagementApi;
