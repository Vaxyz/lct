import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, ImagePlus, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useAdminEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  usePublishEventMutation,
  useCancelEventMutation,
  useEventCategoriesQuery,
  useCreateEventCategoryMutation,
  useUpdateEventCategoryMutation,
  useDeleteEventCategoryMutation,
} from "../../features/events/eventsApi";
import { useUploadEventImageMutation } from "../../features/storage/storageApi";
import type { EventRequest } from "../../features/events/eventsApi";
import { Pagination } from "../../components/ui/Pagination";

const empty: EventRequest = {
  title: "",
  description: "",
  category: "Worship",
  venue: "",
  address: "",
  startAt: "",
  endAt: "",
  timezone: "Africa/Lagos",
  capacity: undefined,
  registrationRequired: true,
  featured: false,
  coverImageUrl: "",
};
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function EventAdminPage() {
  const { data = [], isLoading } = useAdminEventsQuery();
  const [listPage, setListPage] = useState(1);
  const listPageSize = 5;
  const [create, { isLoading: creating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: updating }] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [publish] = usePublishEventMutation();
  const [cancel] = useCancelEventMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadEventImageMutation();
  const [form, setForm] = useState<EventRequest>(empty);
  const { data: categories = [] } = useEventCategoriesQuery();
  const [createCategory, { isLoading: creatingCategory }] =
    useCreateEventCategoryMutation();
  const [updateCategory] = useUpdateEventCategoryMutation();
  const [deleteCategory] = useDeleteEventCategoryMutation();
  const [categoryName, setCategoryName] = useState("");
  const [categoryMessage, setCategoryMessage] = useState("");
  const canManageCategories = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("lct_user") || "{}").roles || []
      ).includes("SUPER_ADMIN");
    } catch {
      return false;
    }
  })();
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const change = (k: keyof EventRequest, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));
  const chooseImage = (file?: File) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setMessage("Cover image must not exceed 2 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setMessage("Cover image must be an image file.");
      return;
    }
    setSelectedImage(file);
    setMessage("");
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      let coverImageUrl = form.coverImageUrl;
      if (form.featured && !selectedImage && !form.coverImageUrl) {
        setMessage("A featured event must have a cover image.");
        return;
      }
      if (selectedImage) {
        const fd = new FormData();
        fd.append("file", selectedImage);
        const uploaded = await uploadImage(fd).unwrap();
        coverImageUrl = uploaded.url;
      }
      const body: EventRequest = {
        ...form,
        coverImageUrl,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
      };
      if (editingEventId) {
        await updateEvent({ id: editingEventId, body }).unwrap();
      } else {
        await create(body).unwrap();
      }
      setForm(empty);
      setSelectedImage(null);
      if (fileRef.current) fileRef.current.value = "";
      setEditingEventId(null);
      setMessage(editingEventId ? "Event updated successfully." : "Event created as draft.");
    } catch {
      setMessage(
        "Unable to create event. Please check your permissions and image configuration.",
      );
    }
  };
  return (
    <main className="page">
      <div className="mb-6">
        <Link className="back" to="/dashboard">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>
      <section className="hero compact">
        <span className="eyebrow">EVENT ADMINISTRATION</span>
        <h1>Plan the next gathering.</h1>
        <p>
          Create, publish and manage church events and registration capacity.
        </p>
      </section>
      <form className="form-card event-form" onSubmit={submit}>
        <h2>{editingEventId ? "Update event" : "Create event"}</h2>
        {message && (
          <p className={message.startsWith("Event") ? "success" : "error"}>
            {message}
          </p>
        )}
        <label>
          Title
          <input
            value={form.title}
            onChange={(e) => change("title", e.target.value)}
            required
          />
        </label>
        <label>
          Event category
          <select
            value={form.category ?? ""}
            onChange={(e) => change("category", e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <small>Create an event category before creating an event.</small>
          )}
        </label>
        {(["venue", "address"] as const).map((k) => (
          <label key={k}>
            {k === "venue" ? "Venue" : "Address"}
            <input
              value={form[k] ?? ""}
              onChange={(e) => change(k, e.target.value)}
            />
          </label>
        ))}
        <label>
          Description
          <textarea
            value={form.description ?? ""}
            onChange={(e) => change("description", e.target.value)}
          />
        </label>
        <div className="form-row">
          <label>
            Starts
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => change("startAt", e.target.value)}
              required
            />
          </label>
          <label>
            Ends
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => change("endAt", e.target.value)}
              required
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Capacity
            <input
              type="number"
              min="1"
              value={form.capacity ?? ""}
              onChange={(e) =>
                change(
                  "capacity",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          </label>
          <label>
            Registration required
            <select
              value={String(form.registrationRequired)}
              onChange={(e) =>
                change("registrationRequired", e.target.value === "true")
              }
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 font-bold">
            <ImagePlus size={18} /> Cover image
          </div>
          <p className="mt-1 text-sm text-slate-500">
            JPG, PNG or WebP. Maximum 2 MB. The file is stored in Cloudinary;
            only its URL is saved with the event.
          </p>
          <input
            ref={fileRef}
            className="mt-3"
            type="file"
            accept="image/*"
            onChange={(e) => chooseImage(e.target.files?.[0])}
          />
          {selectedImage && (
            <p className="mt-2 text-sm font-semibold">
              {selectedImage.name} ·{" "}
              {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => change("featured", e.target.checked)}
          />{" "}
          Feature this event on the home page
        </label>
        <button className="button" disabled={creating || uploading}>
          {creating || updating || uploading ? (
            <>
              <Upload size={16} className="mr-2 animate-pulse" />
              {uploading ? "Uploading image..." : updating ? "Updating event..." : "Saving event..."}
            </>
          ) : (
            editingEventId ? "Save event changes" : "Create draft"
          )}
        </button>
        {editingEventId && (
          <button
            type="button"
            className="button secondary mt-3"
            onClick={() => {
              setEditingEventId(null);
              setForm(empty);
              setSelectedImage(null);
              if (fileRef.current) fileRef.current.value = "";
              setMessage("Event editing cancelled.");
            }}
          >
            Cancel editing
          </button>
        )}
      </form>
      {canManageCategories && (
        <section className="form-card">
          <h2>Manage event categories</h2>
          <p className="text-sm text-slate-600">
            Categories are shared across events. Categories assigned to an event
            cannot be deleted until the event is reassigned.
          </p>
          {categoryMessage && (
            <p
              className={
                categoryMessage.startsWith("Category") ? "success" : "error"
              }
            >
              {categoryMessage}
            </p>
          )}
          <form
            className="form-row"
            onSubmit={async (e) => {
              e.preventDefault();
              setCategoryMessage("");
              try {
                await createCategory({ name: categoryName.trim() }).unwrap();
                setCategoryName("");
                setCategoryMessage("Category created.");
              } catch {
                setCategoryMessage(
                  "Unable to create category. The name may already exist.",
                );
              }
            }}
          >
            <label>
              New category
              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </label>
            <button className="button" disabled={creatingCategory}>
              Add category
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
              >
                <strong>{c.name}</strong>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={async () => {
                      const name = window.prompt(
                        "Update category name",
                        c.name,
                      );
                      if (name && name.trim() && name.trim() !== c.name) {
                        try {
                          await updateCategory({
                            id: c.id,
                            body: { name: name.trim() },
                          }).unwrap();
                          setCategoryMessage("Category updated.");
                        } catch {
                          setCategoryMessage("Unable to update category.");
                        }
                      }
                    }}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={async () => {
                      if (window.confirm(`Delete category “${c.name}”?`)) {
                        try {
                          await deleteCategory(c.id).unwrap();
                          setCategoryMessage("Category deleted.");
                        } catch {
                          setCategoryMessage(
                            "This category may be assigned to an event and cannot be deleted yet.",
                          );
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="admin-list">
        <h2>Events</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          data
            .slice((listPage - 1) * listPageSize, listPage * listPageSize)
            .map((e) => (
              <article className="admin-row" key={e.id}>
                <div>
                  <strong>{e.title}</strong>
                  <small>
                    {new Date(e.startAt).toLocaleString()} · {e.status} ·{" "}
                    {e.registeredCount}
                    {e.capacity ? `/${e.capacity}` : ""} registered
                  </small>
                </div>
                <div className="admin-actions">
                  <button
                    className="button secondary"
                    onClick={() => {
                      const toLocalInput = (value: string) => {
                        const date = new Date(value);
                        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                        return local.toISOString().slice(0, 16);
                      };
                      setEditingEventId(e.id);
                      setSelectedImage(null);
                      if (fileRef.current) fileRef.current.value = "";
                      setForm({
                        title: e.title,
                        description: e.description ?? "",
                        category: e.category ?? "",
                        venue: e.venue ?? "",
                        address: e.address ?? "",
                        startAt: toLocalInput(e.startAt),
                        endAt: toLocalInput(e.endAt),
                        timezone: e.timezone || "Africa/Lagos",
                        capacity: e.capacity,
                        registrationRequired: e.registrationRequired,
                        featured: e.featured,
                        coverImageUrl: e.coverImageUrl ?? "",
                      });
                      setMessage(`Editing: ${e.title}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Edit
                  </button>
                  {e.status === "DRAFT" && (
                    <button className="button" onClick={() => publish(e.id)}>
                      Publish
                    </button>
                  )}
                  {e.status === "PUBLISHED" && (
                    <button
                      className="button secondary"
                      onClick={() => cancel(e.id)}
                    >
                      Cancel event
                    </button>
                  )}
                  {canManageCategories && (
                    <button
                      className="button danger"
                      onClick={async () => {
                        if (!window.confirm(`Permanently delete “${e.title}”? This also removes its registrations.`)) return;
                        try {
                          await deleteEvent(e.id).unwrap();
                          setMessage(`Event “${e.title}” deleted.`);
                        } catch {
                          setMessage("Unable to delete event. Confirm that you are signed in as SUPER_ADMIN.");
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            ))
        )}
        <Pagination
          page={listPage}
          pageSize={listPageSize}
          totalItems={data.length}
          onPageChange={setListPage}
          label="events"
        />
      </section>
    </main>
  );
}
