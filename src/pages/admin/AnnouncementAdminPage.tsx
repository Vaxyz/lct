import { useState } from "react";
import { Pagination } from "../../components/ui/Pagination";
import {
  useCreateAnnouncementMutation,
  useGetAdminAnnouncementsQuery,
  useUpdateAnnouncementMutation,
  type Announcement,
  type AnnouncementRequest,
} from "../../features/announcements/announcementsApi";

const empty = (): AnnouncementRequest => ({
  title: "",
  body: "",
  audienceType: "ALL",
  targetRole: "",
  status: "DRAFT",
  publishAt: "",
});
export function AnnouncementAdminPage() {
  const { data, isLoading, error } = useGetAdminAnnouncementsQuery();
  const [create, createState] = useCreateAnnouncementMutation();
  const [update, updateState] = useUpdateAnnouncementMutation();
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementRequest>(empty());
  const [message, setMessage] = useState("");
  const [listPage, setListPage] = useState(1);
  const listPageSize = 5;
  const edit = (a: Announcement) => {
    setSelected(a);
    setForm({
      title: a.title,
      body: a.body,
      audienceType: a.audienceType,
      targetRole: a.targetRole ?? "",
      status: a.status,
      publishAt: a.publishAt ?? "",
    });
    setMessage("");
  };
  const reset = () => {
    setSelected(null);
    setForm(empty());
    setMessage("");
  };
  const change = (key: keyof AnnouncementRequest, value: string) =>
    setForm((current) => ({ ...current, [key]: value }) as AnnouncementRequest);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const body = {
      ...form,
      targetRole: form.audienceType === "ROLE" ? form.targetRole : null,
      publishAt: form.status === "SCHEDULED" ? form.publishAt : null,
    };
    try {
      if (selected) await update({ id: selected.id, body }).unwrap();
      else await create(body).unwrap();
      setMessage(
        "Announcement saved. Scheduled announcements publish automatically at their configured time.",
      );
      reset();
    } catch {
      setMessage(
        "Could not save announcement. Check required fields and your permission.",
      );
    }
  }
  const busy = createState.isLoading || updateState.isLoading;
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">
          Stage 7 · Communication
        </p>
        <h1 className="text-3xl font-bold">Announcements</h1>
        <p className="mt-2 text-slate-600">
          Publish church-wide or role-targeted messages, or schedule them for
          later.
        </p>
      </header>
      {message && (
        <p
          role="status"
          className="rounded-lg bg-purple-50 p-3 text-purple-900"
        >
          {message}
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <section className="rounded-xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Existing announcements</h2>
            <button
              type="button"
              onClick={reset}
              className="rounded bg-purple-700 px-3 py-2 text-white"
            >
              New
            </button>
          </div>
          {isLoading && <p>Loading announcements…</p>}
          {error && <p role="alert">Unable to load announcements.</p>}
          {(data?.data ?? []).slice((listPage - 1) * listPageSize, listPage * listPageSize).map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => edit(a)}
              className={`mb-2 block w-full rounded-lg border p-3 text-left ${selected?.id === a.id ? "border-purple-600 bg-purple-50" : ""}`}
            >
              <span className="block font-semibold">{a.title}</span>
              <span className="text-sm text-slate-600">
                {a.status} ·{" "}
                {a.audienceType === "ALL" ? "All members" : a.targetRole}
              </span>
              {a.publishAt && (
                <span className="block text-xs text-slate-500">
                  Scheduled: {new Date(a.publishAt).toLocaleString()}
                </span>
              )}
            </button>
          ))}
          <Pagination page={listPage} pageSize={listPageSize} totalItems={(data?.data ?? []).length} onPageChange={setListPage} label="announcements" />
          {!isLoading && !data?.data?.length && (
            <p className="text-slate-600">No announcements yet.</p>
          )}
        </section>
        <form
          onSubmit={submit}
          className="space-y-4 rounded-xl border bg-white p-5"
        >
          <h2 className="text-xl font-semibold">
            {selected ? "Edit announcement" : "Create announcement"}
          </h2>
          <label className="block text-sm font-medium">
            Title
            <input
              required
              maxLength={180}
              value={form.title}
              onChange={(e) => change("title", e.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Message
            <textarea
              required
              rows={5}
              value={form.body}
              onChange={(e) => change("body", e.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Audience
            <select
              value={form.audienceType}
              onChange={(e) => change("audienceType", e.target.value)}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="ALL">All enabled members</option>
              <option value="ROLE">Specific role</option>
            </select>
          </label>
          {form.audienceType === "ROLE" && (
            <label className="block text-sm font-medium">
              Target role
              <select
                required
                value={form.targetRole ?? ""}
                onChange={(e) => change("targetRole", e.target.value)}
                className="mt-1 w-full rounded border p-2"
              >
                {[
                  "",
                  "MEMBER",
                  "PASTOR",
                  "CHURCH_ADMIN",
                  "EVENT_ADMIN",
                  "MEDIA_ADMIN",
                  "PRAYER_ADMIN",
                  "FINANCE_ADMIN",
                  "SUPER_ADMIN",
                ].map((r) => (
                  <option key={r} value={r}>
                    {r || "Choose role"}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block text-sm font-medium">
            Status
            <select
              value={form.status}
              onChange={(e) => change("status", e.target.value)}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PUBLISHED">Publish now</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          {form.status === "SCHEDULED" && (
            <label className="block text-sm font-medium">
              Publish date and time
              <input
                type="datetime-local"
                required
                value={form.publishAt ? form.publishAt.slice(0, 16) : ""}
                onChange={(e) =>
                  change(
                    "publishAt",
                    e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  )
                }
                className="mt-1 w-full rounded border p-2"
              />
              <span className="mt-1 block text-xs text-slate-500">
                The selected local time is converted to a timestamp before
                saving.
              </span>
            </label>
          )}
          <div className="flex gap-2">
            <button
              disabled={busy}
              className="rounded bg-purple-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              {busy
                ? "Saving…"
                : selected
                  ? "Save changes"
                  : "Save announcement"}
            </button>
            {selected && (
              <button
                type="button"
                onClick={reset}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
