import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, ShieldCheck, Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useAvailablePermissionsQuery,
  useCreateManagedRoleMutation,
  useManagedRolesQuery,
  useUpdateRolePermissionsMutation,
} from "../../features/auth/roleManagementApi";

export function RolePermissionManagementPage() {
  const rolesQuery = useManagedRolesQuery();
  const permissionsQuery = useAvailablePermissionsQuery();
  const [createRole, createState] = useCreateManagedRoleMutation();
  const [updatePermissions, updateState] = useUpdateRolePermissionsMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const roles = rolesQuery.data?.data ?? [];
  const permissionNames = permissionsQuery.data?.data ?? [];
  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId),
    [roles, selectedRoleId],
  );

  useEffect(() => {
    if (!selectedRoleId && roles.length) setSelectedRoleId(roles[0].id);
  }, [roles, selectedRoleId]);
  useEffect(() => {
    if (selectedRole) setSelectedPermissions(selectedRole.permissions);
  }, [selectedRole]);

  async function submitRole(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const result = await createRole({ name, description }).unwrap();
      setMessage(
        `Role ${result.data.name} created. Select it below to assign permissions.`,
      );
      setName("");
      setDescription("");
      await rolesQuery.refetch();
      setSelectedRoleId(result.data.id);
    } catch (e: any) {
      setError(
        e?.data?.message ??
          "Could not create role. Check the name and try again.",
      );
    }
  }

  async function savePermissions() {
    if (!selectedRole) return;
    setMessage("");
    setError("");
    try {
      const result = await updatePermissions({
        roleId: selectedRole.id,
        permissions: selectedPermissions,
      }).unwrap();
      setMessage(`Permissions saved for ${result.data.name}.`);
      await rolesQuery.refetch();
    } catch (e: any) {
      setError(e?.data?.message ?? "Could not save role permissions.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-5 md:p-8">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-bold text-purple-800"
      >
        <ArrowLeft size={16} /> Back to user management
      </Link>
      <header>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-700">
          Super Admin · Access control
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-4xl font-black md:text-5xl">
          <ShieldCheck size={36} /> Roles & permissions
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Create custom roles and choose which existing platform permissions
          each role receives. Changes are enforced by the backend.
        </p>
      </header>
      {message && (
        <p
          role="status"
          className="rounded-xl bg-green-50 p-4 font-semibold text-green-800"
        >
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 font-semibold text-red-800"
        >
          {error}
        </p>
      )}
      <section className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <form
          onSubmit={submitRole}
          className="h-fit space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div>
            <h2 className="text-2xl font-black">Create a role</h2>
            <p className="mt-2 text-slate-600">
              Use a clear name such as MEDIA_COORDINATOR or WELFARE_TEAM.
            </p>
          </div>
          <label className="block text-sm font-bold">
            Role name
            <input
              required
              minLength={2}
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MEDIA_COORDINATOR"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal"
            />
          </label>
          <label className="block text-sm font-bold">
            Description
            <textarea
              maxLength={255}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What should this role be responsible for?"
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal"
            />
          </label>
          <button
            disabled={createState.isLoading}
            className="inline-flex items-center rounded-xl bg-purple-800 px-5 py-3 font-extrabold text-white disabled:opacity-50"
          >
            <Plus size={18} className="mr-2" />
            {createState.isLoading ? "Creating…" : "Create role"}
          </button>
        </form>
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">Configure permissions</h2>
              <p className="mt-2 text-slate-600">
                Select a role, then check the permissions it needs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                void rolesQuery.refetch();
                void permissionsQuery.refetch();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
          {rolesQuery.isLoading || permissionsQuery.isLoading ? (
            <p>Loading roles and permissions…</p>
          ) : rolesQuery.isError || permissionsQuery.isError ? (
            <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
              Could not load role configuration. Confirm you are signed in as
              SUPER_ADMIN and the backend is running.
            </p>
          ) : (
            <>
              <label className="block text-sm font-bold">
                Role
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                      {role.description ? ` — ${role.description}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              {selectedRole?.name === "SUPER_ADMIN" ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                  The SUPER_ADMIN permission set is protected from bulk
                  replacement to prevent accidental lockout. Create and
                  configure custom roles here; assign them to users from User
                  Management.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">
                      Available permissions{" "}
                      <span className="text-slate-500">
                        ({selectedPermissions.length} selected)
                      </span>
                    </p>
                    <button
                      type="button"
                      className="text-sm font-bold text-purple-800"
                      onClick={() => setSelectedPermissions(permissionNames)}
                    >
                      Select all
                    </button>
                  </div>
                  <div className="grid max-h-[480px] gap-2 overflow-y-auto rounded-2xl border border-slate-200 p-3 sm:grid-cols-2">
                    {permissionNames.map((permission) => (
                      <label
                        key={permission}
                        className="flex cursor-pointer items-start gap-3 rounded-xl p-3 hover:bg-purple-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission)}
                          onChange={(e) =>
                            setSelectedPermissions((old) =>
                              e.target.checked
                                ? [...old, permission]
                                : old.filter((p) => p !== permission),
                            )
                          }
                          className="mt-1 size-4 accent-purple-800"
                        />
                        <span className="break-words text-sm font-semibold">
                          {permission}
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={savePermissions}
                    disabled={!selectedRole || updateState.isLoading}
                    className="inline-flex items-center rounded-xl bg-purple-800 px-5 py-3 font-extrabold text-white disabled:opacity-50"
                  >
                    <Save size={17} className="mr-2" />
                    {updateState.isLoading ? "Saving…" : "Save permissions"}
                  </button>
                </>
              )}
            </>
          )}
        </section>
      </section>
      <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        <strong>Security guidance:</strong> Grant only the permissions each role
        needs. Creating a role does not automatically assign it to any user. Use
        User Management to assign it. Existing user tokens may need a fresh
        sign-in before role or permission changes appear.
      </aside>
    </main>
  );
}
