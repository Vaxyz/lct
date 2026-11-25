import { Link, useParams } from "react-router-dom";
import { CalendarDays, CheckCircle2, MapPin, Users } from "lucide-react";
import {
  useEventQuery,
  useRegisterEventMutation,
} from "../../features/events/eventsApi";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function registrationErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object")
    return "Registration failed. Please try again.";
  const err = error as {
    data?: unknown;
    error?: string;
    status?: string | number;
  };
  if (err.data && typeof err.data === "object") {
    const body = err.data as {
      message?: string;
      detail?: string;
      error?: string;
    };
    if (body.message) return body.message;
    if (body.detail) return body.detail;
    if (body.error) return body.error;
  }
  if (typeof err.data === "string" && err.data.trim()) return err.data;
  if (err.status === 401)
    return "Your session has expired. Please sign in again.";
  if (err.status === 403)
    return "Your account is not permitted to register for this event. Please sign in again or contact the church administrator.";
  if (err.status === 409)
    return "You may already be registered, or this event is no longer accepting registrations.";
  return (
    err.error || "Registration failed. Check your connection and try again."
  );
}

export function EventDetailPage() {
  const { slug = "" } = useParams();
  const { data: event, isLoading, isError } = useEventQuery(slug);
  const [
    register,
    { isLoading: registering, isSuccess, error: registrationError },
  ] = useRegisterEventMutation();
  const logged = Boolean(localStorage.getItem("lct_access_token"));

  if (isLoading)
    return (
      <main className="page">
        <div className="empty">Loading event...</div>
      </main>
    );
  if (isError || !event)
    return (
      <main className="page">
        <div className="empty error">Event not found.</div>
      </main>
    );

  return (
    <main className="page detail">
      <Link className="back" to="/events">
        ← All events
      </Link>
      <div
        className="event-detail-cover"
        style={
          event.coverImageUrl
            ? { backgroundImage: `url(${event.coverImageUrl})` }
            : undefined
        }
      >
        <span>{event.category || "Church Event"}</span>
      </div>
      <span className="eyebrow">
        <CalendarDays size={16} /> {formatDate(event.startAt)}
      </span>
      <h1>{event.title}</h1>
      <p className="lead">{event.description}</p>
      <div className="detail-grid">
        <div className="detail-panel">
          <h3>Event details</h3>
          <p>
            <CalendarDays size={17} /> {formatDate(event.startAt)} —{" "}
            {new Intl.DateTimeFormat("en-NG", {
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(event.endAt))}
          </p>
          {event.venue && (
            <p>
              <MapPin size={17} /> {event.venue}
              {event.address ? `, ${event.address}` : ""}
            </p>
          )}
          {event.registrationRequired && (
            <p>
              <Users size={17} />{" "}
              {event.capacity
                ? `${event.registeredCount} of ${event.capacity} places registered`
                : `${event.registeredCount} registered`}
            </p>
          )}
        </div>
        {event.registrationRequired && (
          <div className="detail-panel registration-panel">
            <h3>Reserve your place</h3>
            {isSuccess ? (
              <p className="success">
                <CheckCircle2 size={18} /> You are registered for this event.
              </p>
            ) : !logged ? (
              <>
                <p>Please sign in to register for this event.</p>
                <Link className="button" to="/login">
                  Sign in to register
                </Link>
              </>
            ) : (
              <button
                className="button"
                disabled={
                  registering ||
                  Boolean(
                    event.capacity && event.registeredCount >= event.capacity,
                  )
                }
                onClick={() => register(event.id)}
              >
                {registering
                  ? "Registering..."
                  : event.capacity && event.registeredCount >= event.capacity
                    ? "Registration full"
                    : "Register for this event"}
              </button>
            )}
            {registrationError && !isSuccess && (
              <p
                role="alert"
                className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800"
              >
                {registrationErrorMessage(registrationError)}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
