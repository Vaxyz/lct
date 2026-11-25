import { Bell, CheckCheck, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Pagination } from "../ui/Pagination";
import { useNavigate } from "react-router-dom";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useGetNotificationPreferencesQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useSendTestNotificationMutation,
} from "../../features/notifications/notificationsApi";
export function NotificationCenter({ canTest = false }: { canTest?: boolean }) {
  const navigate = useNavigate();
  const { data } = useGetNotificationsQuery(undefined, {
    pollingInterval: 15000,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const { data: unread } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 15000,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const {
    data: preferenceData,
    isLoading: preferencesLoading,
    isError: preferencesError,
  } = useGetNotificationPreferencesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const preferenceMap = new Map(
    (preferenceData?.data ?? []).map((p) => [p.category, p]),
  );
  const categoryForType = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes("ANNOUNCEMENT")) return "ANNOUNCEMENTS";
    if (t.includes("EVENT")) return "EVENTS";
    if (t.includes("DEVOTIONAL")) return "DEVOTIONALS";
    if (t.includes("BIBLE_STUDY") || t.includes("READING_PLAN"))
      return "BIBLE_STUDIES";
    if (t.includes("PRAYER")) return "PRAYER";
    if (t.includes("GIVING") || t.includes("PAYMENT")) return "GIVING";
    if (t.includes("ACCOUNT") || t.includes("PASSWORD") || t.includes("LOGIN"))
      return "ACCOUNT";
    return "OTHER";
  };
  // Fail closed: do not render cached notification records until the member's
  // saved preferences have loaded successfully. The preferences API returns all
  // supported categories, including defaults, so only explicit true enables display.
  const preferencesReady = !preferencesLoading && !preferencesError && Array.isArray(preferenceData?.data);
  const visibleItems = preferencesReady
    ? (data?.data ?? []).filter((item) =>
        preferenceMap.get(categoryForType(item.type) as any)?.inAppEnabled === true,
      )
    : [];
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll] = useMarkAllNotificationsReadMutation();
  const [sendTest, { isLoading: testing }] = useSendTestNotificationMutation();
  const items = visibleItems;
  const [page, setPage] = useState(1);
  const pageSize = 5;
  useEffect(() => { setPage(1); }, [items.length]);
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);
  const count = preferencesReady ? (unread?.data ?? 0) : 0;
  async function open(item: (typeof items)[number]) {
    if (!item.read) await markRead(item.id).unwrap();
    if (item.link) navigate(item.link);
  }
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-purple-50 text-purple-800">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              NOTIFICATION CENTER
            </p>
            <h2 className="text-xl font-black">Your church activity</h2>
            <p className="text-sm text-slate-500">
              {count} unread notification{count === 1 ? "" : "s"} · Dashboard
              and email delivery are tracked together.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="button secondary"
            onClick={() => markAll()}
            disabled={!count}
          >
            <CheckCheck size={16} /> Mark all read
          </button>
          {canTest && (
            <button
              className="button"
              onClick={() => sendTest()}
              disabled={testing}
            >
              {testing ? "Sending..." : "Send test notification"}
            </button>
          )}
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {preferencesLoading && <p className="text-sm text-slate-500">Loading your notification preferences…</p>}
        {preferencesError && <p role="alert" className="text-sm text-red-700">Your notification preferences could not be verified, so notifications are temporarily hidden. Please refresh or reopen this page.</p>}
        {pageItems.map((item) => (
          <button
            key={item.id}
            onClick={() => open(item)}
            className={`text-left rounded-2xl border p-4 transition hover:border-purple-300 ${item.read ? "border-slate-100 bg-slate-50/60" : "border-purple-100 bg-purple-50/40"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge">
                    {item.type.replaceAll("_", " ")}
                  </span>
                  {!item.read && (
                    <span className="rounded-full bg-purple-700 px-2 py-0.5 text-[10px] font-black text-white">
                      UNREAD
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-black">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.message}
                </p>
              </div>
              <div className="shrink-0 text-right text-xs text-slate-400">
                <div>{new Date(item.createdAt).toLocaleString()}</div>
                <div className="mt-2 flex items-center justify-end gap-1">
                  {item.emailStatus === "SENT" && (
                    <>
                      <MailCheck size={14} /> Email sent
                    </>
                  )}
                  {item.emailStatus === "FAILED" && "Email failed"}
                  {item.emailStatus === "DISABLED" && "Email disabled"}
                </div>
              </div>
            </div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="empty">
            <Bell size={28} />
            <strong>No notifications yet.</strong>
            <span>Important church activity will appear here.</span>
          </div>
        )}
      </div>
      <Pagination page={page} pageSize={pageSize} totalItems={items.length} onPageChange={setPage} label="notifications" />
    </section>
  );
}
