import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Save, Trash2, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useCreateSermonMutation,
  useMySermonsQuery,
  useUpdateSermonMutation,
  useDeleteSermonMutation,
  usePublishSermonMutation,
} from "../../features/media/mediaApi";
import type { Sermon } from "../../features/media/mediaApi";
import { useUploadMediaAssetMutation } from "../../features/storage/storageApi";

type DraftForm = {
  title: string;
  slug: string;
  speaker: string;
  topic: string;
  bibleReferences: string;
  description: string;
  featured: boolean;
  mediaAssetId: string;
};
const empty: DraftForm = {
  title: "",
  slug: "",
  speaker: "",
  topic: "",
  bibleReferences: "",
  description: "",
  featured: false,
  mediaAssetId: "",
};
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
export function MediaAdminPage() {
  const { data: sermons = [], isLoading, refetch } = useMySermonsQuery();
  const [create, { isLoading: creating }] = useCreateSermonMutation();
  const [update, { isLoading: updating }] = useUpdateSermonMutation();
  const [remove] = useDeleteSermonMutation();
  const [publish] = usePublishSermonMutation();
  const [uploadMedia, { isLoading: uploadingMedia }] = useUploadMediaAssetMutation();
  const [form, setForm] = useState<DraftForm>(empty);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const mediaFileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!editing) return;
    const s = sermons.find((x) => x.id === editing);
    if (s)
      setForm({
        title: s.title,
        slug: s.slug,
        speaker: s.speaker,
        topic: s.topic ?? "",
        bibleReferences: s.bibleReferences ?? "",
        description: s.description ?? "",
        featured: s.featured,
        mediaAssetId: s.mediaAssetId ?? "",
      });
  }, [editing, sermons]);
  const change = (key: keyof DraftForm, value: string | boolean) =>
    setForm((f) => ({
      ...f,
      [key]: value,
      ...(key === "title" && !editing ? { slug: slugify(String(value)) } : {}),
    }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      let mediaAssetId = form.mediaAssetId || null;
      if (selectedMedia) {
        const uploadForm = new FormData();
        uploadForm.append("file", selectedMedia);
        const uploaded = await uploadMedia(uploadForm).unwrap();
        mediaAssetId = uploaded.id;
      }
      const body = { ...form, slug: form.slug || slugify(form.title), mediaAssetId };
      if (editing) await update({ id: editing, body }).unwrap();
      else await create(body).unwrap();
      setMessage(editing ? "Sermon draft updated." : "Sermon draft created.");
      setForm(empty);
      setSelectedMedia(null);
      if (mediaFileRef.current) mediaFileRef.current.value = "";
      setEditing(null);
      await refetch();
    } catch {
      setError(
        "Unable to save this sermon. Check your permissions, Cloudinary configuration, file type/size, and ensure the slug is unique.",
      );
    }
  };
  const deleteSermon = async (s: Sermon) => {
    if (!window.confirm(`Delete “${s.title}”? This cannot be undone.`)) return;
    try {
      await remove(s.id).unwrap();
      if (editing === s.id) {
        setEditing(null);
        setForm(empty);
      }
      setMessage("Sermon deleted.");
    } catch {
      setError(
        "Unable to delete this sermon. You can only delete sermons you created and must have SERMON_DELETE permission.",
      );
    }
  };
  const publishSermon = async (s: Sermon) => {
    try {
      await publish(s.id).unwrap();
      await refetch();
      setMessage(`“${s.title}” is now published and available in the public sermon library.`);
    } catch {
      setError("Unable to publish this sermon. Check your permissions.");
    }
  };
  return (
    <main className="page">
      <div className="mb-6">
        <Link className="back" to="/dashboard">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>
      <div className="hero compact">
        <span className="eyebrow">SERMON LIBRARY</span>
        <h1>{editing ? "Edit sermon" : "Create a sermon"}</h1>
        <p>
          A draft is the sermon record itself, including its title, speaker,
          topic, Bible references and sermon notes/content. Save it as a draft,
          revise it, and publish it when ready.
        </p>
      </div>
      <form className="form-card" onSubmit={submit}>
        <h2>{editing ? "Update sermon draft" : "New sermon draft"}</h2>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <label>
          Sermon title
          <input
            required
            value={form.title}
            onChange={(e) => change("title", e.target.value)}
          />
        </label>
        <label>
          URL slug
          <input
            required
            value={form.slug}
            onChange={(e) => change("slug", e.target.value)}
          />
          <small>Generated from the title. You can edit it if needed.</small>
        </label>
        <label>
          Speaker / Pastor
          <input
            required
            value={form.speaker}
            onChange={(e) => change("speaker", e.target.value)}
          />
        </label>
        <label>
          Topic
          <input
            value={form.topic}
            onChange={(e) => change("topic", e.target.value)}
          />
        </label>
        <label>
          Bible references
          <input
            placeholder="e.g. John 15:1–8; Psalm 23"
            value={form.bibleReferences}
            onChange={(e) => change("bibleReferences", e.target.value)}
          />
        </label>
        <label>
          Video or audio file (optional)
          <input
            ref={mediaFileRef}
            type="file"
            accept="video/*,audio/*"
            onChange={(e) => setSelectedMedia(e.target.files?.[0] ?? null)}
          />
          <small>Upload a sermon recording to Cloudinary (maximum 500 MB). Configure Cloudinary credentials on the backend first.</small>
          {selectedMedia && <small>Selected: {selectedMedia.name} ({(selectedMedia.size / (1024 * 1024)).toFixed(1)} MB)</small>}
          {!selectedMedia && form.mediaAssetId && <small>A media file is already attached. Choose a new file to replace it.</small>}
        </label>
        <label>
          Sermon content / notes
          <textarea
            rows={8}
            value={form.description}
            onChange={(e) => change("description", e.target.value)}
            placeholder="Write the sermon manuscript, outline, teaching notes or summary…"
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => change("featured", e.target.checked)}
          />{" "}
          Feature this sermon when published
        </label>
        <div className="flex flex-wrap gap-3">
          <button className="button" disabled={creating || updating || uploadingMedia}>
            {creating || updating || uploadingMedia ? (
              <>
                <Upload size={16} className="mr-2 animate-pulse" />
                {uploadingMedia ? "Uploading media…" : "Saving…"}
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {editing ? "Save changes" : "Save sermon draft"}
              </>
            )}
          </button>
          {editing && (
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setEditing(null);
                setForm(empty);
                setSelectedMedia(null);
                if (mediaFileRef.current) mediaFileRef.current.value = "";
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>
      <section className="admin-list">
        <h2>My sermons</h2>
        {isLoading ? (
          <p>Loading sermons…</p>
        ) : sermons.length === 0 ? (
          <p>No sermons yet. Create your first sermon draft above.</p>
        ) : (
          sermons.map((s) => (
            <article className="admin-row" key={s.id}>
              <div>
                <strong>{s.title}</strong>
                <small className="mt-1 flex flex-wrap items-center gap-2">
                  <span>{s.speaker}</span>
                  <span aria-hidden="true">·</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold ${s.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" : s.status === "ARCHIVED" ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-800"}`}>
                    {s.status === "PUBLISHED" ? "✓ Published" : s.status === "ARCHIVED" ? "Archived" : "Draft"}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{s.topic || "No topic yet"}</span>
                  {s.publishedAt && <span>· Published {new Date(s.publishedAt).toLocaleDateString()}</span>}
                </small>
                {s.description && (
                  <p className="mt-2 text-sm text-slate-600">
                    {s.description.slice(0, 180)}
                    {s.description.length > 180 ? "…" : ""}
                  </p>
                )}
              </div>
              <div className="admin-actions">
                <button
                  className="button secondary"
                  onClick={() => {
                    setEditing(s.id);
                    setMessage("");
                    setError("");
                  }}
                >
                  Edit
                </button>
                {s.status !== "PUBLISHED" && (
                  <button className="button" onClick={() => publishSermon(s)}>
                    Publish
                  </button>
                )}
                <button
                  className="button secondary"
                  onClick={() => deleteSermon(s)}
                >
                  <Trash2 size={15} className="mr-1" />
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
