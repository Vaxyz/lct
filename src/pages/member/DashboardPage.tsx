import {
  CalendarDays,
  Church,
  HeartHandshake,
  LogOut,
  PlayCircle,
  ShieldCheck,
  Video,
  Wallet,
  BookOpen,
  ClipboardList,
  BarChart3,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMeQuery } from "../../features/auth/authApi";
import { useGetProtectedChurchQuery } from "../../features/church/churchApi";
import { NotificationCenter } from "../../components/notifications/NotificationCenter";
import {
  useEventsQuery,
  type EventItem,
} from "../../features/events/eventsApi";
import { useMemo, useState } from "react";

const has = (user: any, permission: string) =>
  (user?.permissions ?? []).includes(permission);
const role = (user: any) => user?.roles?.[0] ?? "MEMBER";

function localDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function PastorChurchCalendar() {
  const { data: events = [], isLoading, isError } = useEventsQuery();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() =>
    localDayKey(new Date()),
  );
  const days = useMemo(() => {
    const first = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1,
    );
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0,
    ).getDate();
    const cells: Array<Date | null> = Array.from(
      { length: offset },
      () => null,
    );
    for (let day = 1; day <= count; day++)
      cells.push(
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day),
      );
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [visibleMonth]);
  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    events.forEach((event) => {
      const key = localDayKey(new Date(event.startAt));
      map.set(key, [...(map.get(key) ?? []), event]);
    });
    return map;
  }, [events]);
  const selectedEvents = eventsByDay.get(selectedDate) ?? [];
  const title = new Intl.DateTimeFormat("en-NG", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);
  const shiftMonth = (amount: number) => {
    const next = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + amount,
      1,
    );
    setVisibleMonth(next);
    setSelectedDate(localDayKey(next));
  };

  return (
    <section
      className="event-calendar mt-8"
      aria-label="Pastor church calendar"
    >
      <div className="event-calendar-header">
        <div>
          <span className="eyebrow">PASTORAL OVERVIEW</span>
          <h2>{title}</h2>
          <p>{events.length} upcoming events available</p>
        </div>
        <div className="calendar-controls">
          <button
            type="button"
            className="button secondary calendar-nav"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>
          <button
            type="button"
            className="button secondary calendar-nav"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-days">
        {days.map((day, index) => {
          if (!day)
            return (
              <div
                className="calendar-day calendar-day--blank"
                key={`blank-${index}`}
                aria-hidden="true"
              />
            );
          const key = localDayKey(day);
          const dayEvents = eventsByDay.get(key) ?? [];
          const selected = selectedDate === key;
          const today = key === localDayKey(new Date());
          return (
            <button
              type="button"
              key={key}
              className={`calendar-day${selected ? " is-selected" : ""}${today ? " is-today" : ""}${dayEvents.length ? " has-events" : ""}`}
              onClick={() => setSelectedDate(key)}
              aria-pressed={selected}
              aria-label={`${day.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}${dayEvents.length ? `, ${dayEvents.length} events` : ""}`}
            >
              <span className="calendar-day-number">{day.getDate()}</span>
              {dayEvents.length > 0 && (
                <span className="calendar-event-dots" aria-hidden="true">
                  {dayEvents.slice(0, 3).map((event) => (
                    <i key={event.id} />
                  ))}
                </span>
              )}
              {dayEvents.length > 0 && (
                <span className="calendar-day-count">
                  {dayEvents.length}{" "}
                  {dayEvents.length === 1 ? "event" : "events"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="calendar-agenda">
        <div className="calendar-agenda-title">
          <CalendarDays size={19} />
          <h3>
            {new Intl.DateTimeFormat("en-NG", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }).format(new Date(`${selectedDate}T12:00:00`))}
          </h3>
        </div>
        {isLoading ? (
          <p className="calendar-message">Loading church events…</p>
        ) : isError ? (
          <p className="calendar-message error">
            Unable to load events. Please try again.
          </p>
        ) : selectedEvents.length === 0 ? (
          <p className="calendar-message">No published events on this date.</p>
        ) : (
          <div className="calendar-agenda-list">
            {selectedEvents.map((event) => (
              <Link
                to={`/events/${event.slug}`}
                className="calendar-agenda-event"
                key={event.id}
              >
                <span className="agenda-time">
                  {new Intl.DateTimeFormat("en-NG", {
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(event.startAt))}
                </span>
                <span className="agenda-event-info">
                  <strong>{event.title}</strong>
                  <small>
                    {event.category || "Church Event"}
                    {event.venue ? ` · ${event.venue}` : ""}
                  </small>
                </span>
                <ChevronRight size={18} />
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4">
        <Link className="button secondary" to="/events">
          Open full church calendar
        </Link>
      </div>
    </section>
  );
}

function ActionCard({
  to,
  title,
  text,
  Icon,
}: {
  to: string;
  title: string;
  text: string;
  Icon: typeof Church;
}) {
  return (
    <Link to={to} className="card group">
      <div className="grid size-11 place-items-center rounded-2xl bg-purple-50 text-purple-800 group-hover:bg-purple-800 group-hover:text-white">
        <Icon size={21} />
      </div>
      <h2 className="mt-5 font-black">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </Link>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useMeQuery();
  const user =
    data?.data ?? JSON.parse(localStorage.getItem("lct_user") ?? "null");
  const { isError: profileError, isSuccess: profileSuccess } =
    useGetProtectedChurchQuery(undefined, {
      skip: !user || !has(user, "CHURCH_PROFILE_VIEW"),
    });
  const currentRole = role(user);

  const logout = () => {
    localStorage.removeItem("lct_access_token");
    localStorage.removeItem("lct_user");
    navigate("/login", { replace: true });
  };
  if (isError) {
    logout();
    return null;
  }

  const configs: Record<
    string,
    {
      eyebrow: string;
      title: string;
      subtitle: string;
      actions: {
        to: string;
        title: string;
        text: string;
        Icon: typeof Church;
      }[];
    }
  > = {
    SUPER_ADMIN: {
      eyebrow: "PLATFORM ADMINISTRATION",
      title: "Control the whole LCT platform.",
      subtitle:
        "Manage church operations, content, events, giving and platform security from one workspace.",
      actions: [
        {
          to: "/admin/events",
          title: "Events",
          text: "Create, publish and manage registrations.",
          Icon: CalendarDays,
        },
        {
          to: "/admin/media",
          title: "Media",
          text: "Manage sermons and Church TV content.",
          Icon: Video,
        },
        {
          to: "/admin/giving",
          title: "Giving",
          text: "Review financial transactions and payment providers.",
          Icon: Wallet,
        },
        {
          to: "/admin/prayer",
          title: "Prayer Care",
          text: "Review and shepherd prayer requests.",
          Icon: HeartHandshake,
        },
        {
          to: "/events",
          title: "Church Calendar",
          text: "Review the public events experience.",
          Icon: ClipboardList,
        },
        {
          to: "/church-tv",
          title: "Church TV",
          text: "Open the live media experience.",
          Icon: PlayCircle,
        },
        {
          to: "/sermons",
          title: "Sermons",
          text: "Browse the published library.",
          Icon: BookOpen,
        },
      ],
    },
    CHURCH_ADMIN: {
      eyebrow: "CHURCH ADMINISTRATION",
      title: "Run the church digital experience.",
      subtitle: "Coordinate content, events, giving and church-wide activity.",
      actions: [
        {
          to: "/admin/events",
          title: "Events",
          text: "Manage church programs and registrations.",
          Icon: CalendarDays,
        },
        {
          to: "/admin/media",
          title: "Media",
          text: "Manage sermons and media publishing.",
          Icon: Video,
        },
        {
          to: "/admin/giving",
          title: "Giving",
          text: "Review giving activity.",
          Icon: Wallet,
        },
        {
          to: "/admin/prayer",
          title: "Prayer Care",
          text: "Review and shepherd prayer requests.",
          Icon: HeartHandshake,
        },
        {
          to: "/events",
          title: "Calendar",
          text: "View upcoming church programs.",
          Icon: ClipboardList,
        },
      ],
    },
    MEDIA_ADMIN: {
      eyebrow: "MEDIA ADMINISTRATION",
      title: "Make the message available everywhere.",
      subtitle: "Manage sermons and the Church TV experience.",
      actions: [
        {
          to: "/admin/media",
          title: "Media Library",
          text: "Create and manage sermon content.",
          Icon: Video,
        },
        {
          to: "/church-tv",
          title: "Church TV",
          text: "Monitor the public live experience.",
          Icon: PlayCircle,
        },
        {
          to: "/sermons",
          title: "Sermon Library",
          text: "Review published messages.",
          Icon: BookOpen,
        },
      ],
    },
    EVENT_ADMIN: {
      eyebrow: "EVENT OPERATIONS",
      title: "Bring every gathering to life.",
      subtitle: "Create programs, publish them and monitor registrations.",
      actions: [
        {
          to: "/admin/events",
          title: "Event Manager",
          text: "Create, publish and cancel events.",
          Icon: CalendarDays,
        },
        {
          to: "/events",
          title: "Public Calendar",
          text: "Preview the member-facing calendar.",
          Icon: ClipboardList,
        },
      ],
    },
    PRAYER_ADMIN: {
      eyebrow: "PRAYER CARE",
      title: "Stand with people in prayer.",
      subtitle:
        "Shepherd requests, follow their journey and help the church respond with care.",
      actions: [
        {
          to: "/admin/prayer",
          title: "Prayer Care",
          text: "Review and manage prayer requests.",
          Icon: HeartHandshake,
        },
        {
          to: "/prayer",
          title: "Prayer Wall",
          text: "See public requests and pray with the church.",
          Icon: HeartHandshake,
        },
        {
          to: "/events",
          title: "Church Calendar",
          text: "Stay connected to church gatherings.",
          Icon: CalendarDays,
        },
      ],
    },
    PASTOR: {
      eyebrow: "PASTORAL DASHBOARD",
      title: "Lead with connection and purpose.",
      subtitle: "A pastoral view of the church digital experience.",
      actions: [
        {
          to: "/admin/media",
          title: "Create Sermon",
          text: "Create and manage sermon drafts for the church.",
          Icon: Video,
        },
        {
          to: "/events",
          title: "Upcoming Programs",
          text: "See services and church activities.",
          Icon: CalendarDays,
        },
        {
          to: "/sermons",
          title: "Sermons",
          text: "Review the latest messages.",
          Icon: BookOpen,
        },
        {
          to: "/church-tv",
          title: "Church TV",
          text: "Watch current and recorded services.",
          Icon: PlayCircle,
        },
        {
          to: "/giving",
          title: "My Giving",
          text: "Review your own giving history.",
          Icon: HeartHandshake,
        },
        {
          to: "/prayer",
          title: "Prayer",
          text: "Share and carry prayer requests.",
          Icon: HeartHandshake,
        },
        {
          to: "/prayer/mine",
          title: "My Prayer Requests",
          text: "Follow your submitted requests.",
          Icon: HeartHandshake,
        },
      ],
    },
    MEMBER: {
      eyebrow: "MEMBER DASHBOARD",
      title: `Welcome, ${isLoading ? "Friend" : (user?.firstName ?? "Friend")}.`,
      subtitle: "Your secure LifeChanger Touch experience starts here.",
      actions: [
        {
          to: "/church-tv",
          title: "Church TV",
          text: "Watch services anywhere.",
          Icon: PlayCircle,
        },
        {
          to: "/sermons",
          title: "Sermons",
          text: "Listen and watch messages.",
          Icon: BookOpen,
        },
        {
          to: "/events",
          title: "Events",
          text: "Discover upcoming programs.",
          Icon: CalendarDays,
        },
        {
          to: "/give",
          title: "Give",
          text: "Support the ministry securely.",
          Icon: HeartHandshake,
        },
        {
          to: "/prayer",
          title: "Prayer",
          text: "Share a request and pray with the church family.",
          Icon: HeartHandshake,
        },
        {
          to: "/prayer/mine",
          title: "My Prayer Requests",
          text: "Follow requests you have submitted.",
          Icon: HeartHandshake,
        },
      ],
    },
  };
  const config = configs[currentRole] ?? configs.MEMBER;
  const baseDashboardActions = has(user, "DEVOTIONAL_MANAGE")
    ? [
        ...config.actions,
        {
          to: "/admin/devotionals",
          title: "Devotionals",
          text: "Create, publish and manage daily devotionals.",
          Icon: BookOpen,
        },
      ]
    : config.actions;
  const canViewEngagementAnalytics =
    has(user, "ENGAGEMENT_ANALYTICS_VIEW") ||
    ["SUPER_ADMIN", "CHURCH_ADMIN", "PASTOR"].some((r) =>
      (user?.roles ?? []).includes(r),
    );
  const dashboardActions = canViewEngagementAnalytics
    ? [
        ...baseDashboardActions,
        {
          to: "/admin/leadership-dashboard",
          title: "Leadership Dashboard",
          text: "Review church-wide operational, financial and engagement summaries.",
          Icon: LayoutDashboard,
        },
        {
          to: "/admin/engagement-analytics",
          title: "Engagement Analytics",
          text: "Review Church TV viewing and church engagement summaries.",
          Icon: BarChart3,
        },
        {
          to: "/admin/church-tv/analytics",
          title: "Church TV Analytics",
          text: "View sessions, active viewers and watch-time reports.",
          Icon: PlayCircle,
        },
      ]
    : baseDashboardActions;

  return (
    <main className="page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h1>{config.title}</h1>
          <p className="lead">{config.subtitle}</p>
        </div>
        <button onClick={logout} className="button secondary">
          <LogOut size={17} /> Sign out
        </button>
      </section>
      <div className="role-banner">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/10">
          <ShieldCheck size={22} />
        </div>
        <div>
          <p className="text-sm font-bold text-purple-200">SIGNED IN AS</p>
          <h2 className="text-xl font-black">
            {currentRole.replaceAll("_", " ")}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(user?.roles ?? []).map((r: string) => (
              <span
                key={r}
                className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-black text-purple-950"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
      {currentRole === "PASTOR" && <PastorChurchCalendar />}
      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {dashboardActions.map((a) => (
          <ActionCard key={a.to + a.title} {...a} />
        ))}
      </section>
      {currentRole !== "MEMBER" && (
        <section className="mt-8 cards">
          <div className="card">
            <span className="badge">Role workspace</span>
            <h2 className="mt-3 font-black">
              {currentRole.replaceAll("_", " ")} controls
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              The navigation and actions above are selected from your assigned
              role and permissions.
            </p>
          </div>
          <div className="card">
            <span className="badge">Security</span>
            <h2 className="mt-3 font-black">Protected by backend RBAC</h2>
            <p className="mt-2 text-sm text-slate-500">
              Frontend visibility improves usability; the API remains the final
              authorization boundary.
            </p>
          </div>
        </section>
      )}
      <NotificationCenter
        canTest={
          currentRole === "SUPER_ADMIN" || currentRole === "CHURCH_ADMIN"
        }
      />
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              RBAC status
            </p>
            <h2 className="mt-1 text-lg font-black">
              Protected church profile
            </h2>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${profileSuccess ? "bg-green-50 text-green-700" : profileError ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-500"}`}
          >
            {profileSuccess
              ? "Permission granted"
              : profileError
                ? "Permission denied"
                : "Not required for this role"}
          </span>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-500">Your permissions</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(user?.permissions ?? []).map((permission: string) => (
              <span
                key={permission}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
