import { useMemo, useState, type FormEvent } from "react";
import { CalendarClock, Radio, Save, Trash2, Video, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useAdminStreamsQuery,
  useCreateStreamMutation,
  useDeleteStreamMutation,
  useUpdateStreamMutation,
  type LiveStream,
} from "../../features/media/mediaApi";

type FormState = {
  title: string;
  streamUrl: string;
  playbackUrl: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  recordingEnabled: boolean;
};
const emptyForm: FormState = {
  title: "",
  streamUrl: "",
  playbackUrl: "",
  status: "SCHEDULED",
  scheduledStart: "",
  scheduledEnd: "",
  recordingEnabled: true,
};
function toLocalInput(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toApiDate(value: string) {
  return value ? new Date(value).toISOString() : null;
}
function formFromStream(s: LiveStream): FormState {
  return {
    title: s.title,
    streamUrl: s.streamUrl ?? "",
    playbackUrl: s.playbackUrl ?? "",
    status: s.status,
    scheduledStart: toLocalInput(s.scheduledStart),
    scheduledEnd: toLocalInput(s.scheduledEnd),
    recordingEnabled: s.recordingEnabled,
  };
}
export function ChurchTvAdminPage() {
  const { data: streams = [], isLoading, isError } = useAdminStreamsQuery();
  const [createStream, createState] = useCreateStreamMutation();
  const [updateStream, updateState] = useUpdateStreamMutation();
  const [deleteStream, deleteState] = useDeleteStreamMutation();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const busy =
    createState.isLoading || updateState.isLoading || deleteState.isLoading;
  const sortedStreams = useMemo(() => streams, [streams]);
  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((old) => ({ ...old, [key]: value }));
  }
  function edit(s: LiveStream) {
    setEditingId(s.id);
    setForm(formFromStream(s));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    if (
      form.scheduledStart &&
      form.scheduledEnd &&
      new Date(form.scheduledEnd) <= new Date(form.scheduledStart)
    ) {
      setError("The scheduled end must be after the start.");
      return;
    }
    const payload = {
      ...form,
      streamUrl: form.streamUrl.trim() || null,
      playbackUrl: form.playbackUrl.trim() || null,
      scheduledStart: toApiDate(form.scheduledStart),
      scheduledEnd: toApiDate(form.scheduledEnd),
    };
    try {
      if (editingId)
        await updateStream({ id: editingId, body: payload }).unwrap();
      else await createStream(payload).unwrap();
      setMessage(
        editingId
          ? "Broadcast updated successfully."
          : "Broadcast created successfully.",
      );
      reset();
    } catch (e: any) {
      setError(
        e?.data?.message ??
          e?.data?.detail ??
          "Could not save this broadcast. Check the details and try again.",
      );
    }
  }
  async function remove(s: LiveStream) {
    if (
      !window.confirm(
        `Delete the broadcast “${s.title}”? This cannot be undone.`,
      )
    )
      return;
    setMessage("");
    setError("");
    try {
      await deleteStream(s.id).unwrap();
      if (editingId === s.id) reset();
      setMessage("Broadcast deleted.");
    } catch (e: any) {
      setError(
        e?.data?.message ??
          "Could not delete this broadcast. A live broadcast must be ended first.",
      );
    }
  }
  return (
    <main className="mx-auto max-w-7xl space-y-7 p-4 md:p-8">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-900 p-6 text-white shadow-xl md:p-9">
        <div className="flex items-center gap-3 text-purple-200">
          <Radio size={18} />
          <span className="text-xs font-black uppercase tracking-[0.22em]">
            LCT Broadcast Studio
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-black md:text-4xl">
          Church TV management
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100 md:text-base">
          Configure the stream and playback links, schedule upcoming broadcasts,
          and manage the public Church TV channel.
        </p>
        <div className="mt-5"><Link to="/admin/church-tv/analytics" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-purple-900 hover:bg-purple-50"><BarChart3 size={17}/> View Church TV analytics</Link></div>
      </header>
      {message && (
        <p role="status" className="rounded-xl bg-green-50 p-4 text-green-800">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-purple-100 text-purple-800">
            <Video size={21} />
          </span>
          <div>
            <h2 className="text-xl font-black">
              {editingId ? "Edit broadcast" : "Create a broadcast"}
            </h2>
            <p className="text-sm text-slate-500">
              For YouTube Live Studio or Facebook Live Producer, paste the public viewing link below. Keep encoder stream keys in the platform that hosts the broadcast.
            </p>
          </div>
        </div>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700 md:col-span-2">
            Broadcast title
            <input
              required
              maxLength={255}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Sunday Worship Service"
              className="rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700 md:col-span-2">
            Stream source URL
            <input
              type="url"
              maxLength={1000}
              value={form.streamUrl}
              onChange={(e) => set("streamUrl", e.target.value)}
              placeholder="Public platform link (optional)"
              className="rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
            <span className="font-normal text-xs leading-5 text-slate-500">
              Optional reference only. Use the public viewing link in the Playback URL field below. Never enter a private RTMP ingest URL or encoder stream key.
            </span>
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700 md:col-span-2">
            Playback URL shown to viewers
            <input
              type="url"
              maxLength={1000}
              value={form.playbackUrl}
              onChange={(e) => set("playbackUrl", e.target.value)}
              placeholder="YouTube or Facebook public viewing URL"
              className="rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
            <span className="font-normal text-xs leading-5 text-slate-500">
              Paste a public YouTube watch/live link or Facebook Watch/Live video permalink. LCT embeds supported public links. Facebook videos must be public and allow embedding. Never paste an encoder stream key, private RTMP URL, OAuth secret, or account password here.
            </span>
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Broadcast status
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal"
            >
              {["SCHEDULED", "LIVE", "OFFLINE", "ENDED"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 self-end rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.recordingEnabled}
              onChange={(e) => set("recordingEnabled", e.target.checked)}
              className="size-4 accent-purple-800"
            />{" "}
            Recording enabled
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Scheduled start
            <input
              type="datetime-local"
              value={form.scheduledStart}
              onChange={(e) => set("scheduledStart", e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-3 font-normal"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Scheduled end
            <input
              type="datetime-local"
              value={form.scheduledEnd}
              onChange={(e) => set("scheduledEnd", e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-3 font-normal"
            />
          </label>
          <div className="flex flex-wrap gap-3 pt-2 md:col-span-2">
            <button
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-800 px-5 py-3 font-bold text-white hover:bg-purple-900 disabled:opacity-50"
            >
              <Save size={17} />
              {busy
                ? "Saving…"
                : editingId
                  ? "Save changes"
                  : "Create broadcast"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Broadcasts</h2>
            <p className="mt-1 text-sm text-slate-500">
              {streams.length} configured broadcast
              {streams.length === 1 ? "" : "s"}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-800">
            <CalendarClock size={15} /> Schedule
          </span>
        </div>
        {isLoading && (
          <p className="rounded-xl bg-white p-6 text-slate-500">
            Loading broadcasts…
          </p>
        )}
        {isError && (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
            Could not load broadcasts. Confirm you are signed in as Super Admin.
          </p>
        )}
        {!isLoading && !isError && sortedStreams.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Radio size={34} className="mx-auto text-slate-400" />
            <h3 className="mt-3 font-bold">No broadcasts configured</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create the first broadcast using the form above.
            </p>
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          {sortedStreams.map((s) => (
            <article
              key={s.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${s.status === "LIVE" ? "bg-red-50 text-red-700" : s.status === "SCHEDULED" ? "bg-purple-50 text-purple-800" : "bg-slate-100 text-slate-600"}`}
                  >
                    {s.status === "LIVE" ? "● LIVE" : s.status}
                  </span>
                  <h3 className="mt-3 text-lg font-black">{s.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => edit(s)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    aria-label={`Delete ${s.title}`}
                    onClick={() => remove(s)}
                    disabled={
                      busy ||
                      (s.status === "LIVE" &&
                        (!s.scheduledEnd ||
                          new Date(s.scheduledEnd).getTime() > Date.now()))
                    }
                    title={
                      s.status === "LIVE" &&
                      (!s.scheduledEnd ||
                        new Date(s.scheduledEnd).getTime() > Date.now())
                        ? "This broadcast is still live"
                        : "Delete broadcast"
                    }
                    className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {s.scheduledStart
                  ? new Date(s.scheduledStart).toLocaleString()
                  : "No start time scheduled"}
                {s.scheduledEnd
                  ? ` – ${new Date(s.scheduledEnd).toLocaleString()}`
                  : ""}
              </p>
              <p className="mt-2 break-all text-xs text-slate-500">
                {s.playbackUrl || s.streamUrl || "No playback URL configured"}
              </p>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                Recording {s.recordingEnabled ? "enabled" : "disabled"}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
