import { useState } from "react";
import { Search, ShieldCheck, Users, Save, X } from "lucide-react";
import { useEffect } from "react";
import { Pagination } from "../../components/ui/Pagination";
import {
  useAdminRolesQuery,
  useAdminUsersQuery,
  useAssignUserRoleMutation,
  useRemoveUserRoleMutation,
  type AdminUser,
} from "../../features/auth/userManagementApi";

export function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, isError, refetch } = useAdminUsersQuery(search);
  const { data: roleData, isLoading: rolesLoading } = useAdminRolesQuery();
  const [assignRole, assignState] = useAssignUserRoleMutation();
  const [removeRole, removeState] = useRemoveUserRoleMutation();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const allUsers = data?.data ?? [];
  const pageUsers = allUsers.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage(1);
  }, [search]);
  async function saveRole(user: AdminUser) {
    setMessage("");
    setErrorMessage("");
    try {
      const updated = (
        await assignRole({
          userId: user.id,
          roleName: selected[user.id] ?? user.roles[0] ?? "MEMBER",
        }).unwrap()
      ).data;
      setMessage(`${selected[user.id]} role added to ${updated.firstName} ${updated.lastName}.`);
      refetch();
    } catch (error: any) {
      setErrorMessage(
        error?.data?.message ?? "Role could not be changed. Please try again.",
      );
    }
  }
  async function removeAssignedRole(user: AdminUser, roleName: string) {
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    const confirmed = window.confirm(
      `Remove the ${roleName} role from ${fullName}? This may change the user's access to LCT features.`,
    );
    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");
    try {
      const updated = (await removeRole({ userId: user.id, roleName }).unwrap())
        .data;
      setMessage(
        `${roleName} role removed from ${updated.firstName} ${updated.lastName}.`,
      );
      setSelected((old) => {
        const next = { ...old };
        delete next[user.id];
        return next;
      });
      refetch();
    } catch (error: any) {
      setErrorMessage(
        error?.data?.message ??
          "The role could not be removed. Please try again.",
      );
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-purple-700">
          Platform administration
        </p>
        <h1 className="mt-1 flex items-center gap-3 text-3xl font-black">
          <Users /> User and role management
        </h1>
        <p className="mt-2 text-slate-600">
          Search registered users, assign roles, and remove individual assigned
          roles. Role changes are enforced by the backend.
        </p>
      </header>
      {message && (
        <p role="status" className="rounded-xl bg-green-50 p-4 text-green-800">
          {message}
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
          {errorMessage}
        </p>
      )}
      <label className="flex max-w-xl items-center gap-3 rounded-xl border border-slate-300 bg-white px-4">
        <Search size={18} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email or role…"
          className="w-full py-3 outline-none"
        />
      </label>
      {isLoading && <p>Loading users…</p>}
      {isError && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
          Users could not be loaded. Confirm that you are signed in as Super
          Admin.
        </p>
      )}
      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Current role</th>
                <th className="p-4">Assign role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="p-4 font-bold">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center gap-1 rounded-full bg-purple-50 py-1 pl-2.5 pr-1 text-xs font-bold text-purple-800"
                        >
                          {role}
                           
<button
  type="button"
  aria-label={`Remove ${role} role from ${user.firstName} ${user.lastName}`}
  title={
    user.roles.length <= 1
      ? "A user must retain at least one role"
      : `Remove ${role} role`
  }
  disabled={removeState.isLoading || user.roles.length <= 1}
  onClick={() => removeAssignedRole(user, role)}
  className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-purple-300 bg-white text-purple-800 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100"
>
  <X size={14} strokeWidth={2.5} />
</button>
 
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      aria-label={`Add a role for ${user.email}`}
                      disabled={rolesLoading}
                      value={selected[user.id] ?? ""}
                      onChange={(e) =>
                        setSelected((old) => ({
                          ...old,
                          [user.id]: e.target.value,
                        }))
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                    >
                      <option value="">Add a role…</option>
                      {(roleData?.data ?? [])
                        .filter((role) => !user.roles.includes(role))
                        .map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${user.enabled ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {user.enabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      disabled={
                        assignState.isLoading ||
                        removeState.isLoading ||
                        !selected[user.id] ||
                        user.roles.includes(selected[user.id])
                      }
                      onClick={() => saveRole(user)}
                      className="inline-flex items-center gap-2 rounded-lg bg-purple-800 px-3 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Save size={14} /> Add role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allUsers.length === 0 && (
            <p className="p-8 text-center text-slate-500">
              No registered users match your search.
            </p>
          )}
        </div>
      )}
      {!isLoading && !isError && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={allUsers.length}
          onPageChange={setPage}
          label="users"
        />
      )}
      <section className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <ShieldCheck size={20} className="shrink-0" />
        <p>
          Only Super Admin can access this page. Remove a role using the ×
          beside its label. Users must retain at least one role, and the backend
          prevents removal of the last active Super Admin. Assign elevated roles
          only to trusted users.
        </p>
      </section>
    </main>
  );
}
