import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Gift, HeartHandshake, MessageCircle, PlayCircle, Radio, Send, PanelRight } from "lucide-react";
import { useFundsQuery } from "../../features/giving/givingApi";
import { useSubmitPrayerRequestMutation } from "../../features/prayer/prayerApi";
import {
  useCurrentStreamQuery,
  useChatMessagesQuery,
  useSendChatMessageMutation,
} from "../../features/media/mediaApi";

/** Convert a public YouTube watch/live link into a privacy-enhanced embed URL.
 * Never use an encoder stream key here; this accepts only a public viewing URL.
 */
function youtubeEmbedUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!["youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host)) return null;

    let videoId = "";
    if (host === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v") ?? "";
    } else {
      const match = url.pathname.match(/^\/(?:live|embed|shorts)\/([A-Za-z0-9_-]{11})(?:\/|$)/);
      videoId = match?.[1] ?? "";
    }
    return /^[A-Za-z0-9_-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}

function isYouTubeUrl(value?: string | null): boolean {
  if (!value) return false;
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return ["youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host);
  } catch {
    return false;
  }
}

/** Convert a public Facebook video/live permalink into Facebook's video embed URL.
 * This only accepts public viewing links; never provide RTMP ingest URLs or stream keys.
 */
function facebookEmbedUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!["facebook.com", "m.facebook.com", "web.facebook.com", "fb.watch"].includes(host)) return null;
    if (host !== "fb.watch" && !(
      url.pathname === "/watch" ||
      url.pathname.startsWith("/live/") ||
      /\/videos\//.test(url.pathname) ||
      /\/reel\//.test(url.pathname)
    )) return null;
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.toString())}&show_text=false&width=1280`;
  } catch {
    return null;
  }
}

function isFacebookUrl(value?: string | null): boolean {
  if (!value) return false;
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return ["facebook.com", "m.facebook.com", "web.facebook.com", "fb.watch"].includes(host);
  } catch {
    return false;
  }
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const clock = [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
  return days > 0 ? `${days}d ${clock}` : clock;
}

export function ChurchTvPage() {
  const { data: current, isLoading } = useCurrentStreamQuery(undefined, {
    pollingInterval: 15000, refetchOnFocus: true,
  });
  const { data: givingFunds = [], isLoading: fundsLoading, isError: fundsError } = useFundsQuery();
  const isLive = current?.status === "LIVE";
  const { currentData: chatMessages = [] } = useChatMessagesQuery(current?.id ?? "", {
    skip: !current?.id || !isLive, pollingInterval: 5000, refetchOnFocus: true,
  });
  const [sendChatMessage, sendState] = useSendChatMessageMutation();
  const [now, setNow] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [chatNotice, setChatNotice] = useState("");
  const [chatOnRight, setChatOnRight] = useState(false);
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [prayerContent, setPrayerContent] = useState("");
  const [prayerVisibility, setPrayerVisibility] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");
  const [prayerAnonymous, setPrayerAnonymous] = useState(false);
  const [prayerNotice, setPrayerNotice] = useState("");
  const [submitPrayer, prayerState] = useSubmitPrayerRequestMutation();
  const [isRegistered, setIsRegistered] = useState(() => Boolean(localStorage.getItem("lct_access_token")));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const refreshAuth = () => setIsRegistered(Boolean(localStorage.getItem("lct_access_token")));
    window.addEventListener("storage", refreshAuth);
    window.addEventListener("focus", refreshAuth);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", refreshAuth);
      window.removeEventListener("focus", refreshAuth);
    };
  }, []);

  // Record anonymous Church TV viewing sessions. Session IDs are random and scoped to
  // this browser viewing instance; the API does not receive account identity or IP metadata.
  useEffect(() => {
    if (!isLive || !current?.id) return;

    const streamId = current.id;
    const sessionId = crypto.randomUUID();
    const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
    const sendEvent = (event: "START" | "HEARTBEAT" | "END", keepalive = false) => {
      try {
        const request = fetch(`${apiBase}/v1/church-tv/${streamId}/view-sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, event }),
          keepalive,
        });
        // Analytics is best-effort and must never interrupt the viewing experience.
        void request.catch(() => undefined);
      } catch {
        // Ignore browser/network errors for non-essential analytics.
      }
    };

    sendEvent("START");
    const heartbeat = window.setInterval(() => sendEvent("HEARTBEAT"), 30_000);
    return () => {
      window.clearInterval(heartbeat);
      sendEvent("END", true);
    };
  }, [isLive, current?.id]);

  const startMs = current?.scheduledStart ? new Date(current.scheduledStart).getTime() : null;
  const countdown = startMs !== null ? formatCountdown(startMs - now) : null;

  async function submitChat(e: FormEvent) {
    e.preventDefault();
    setChatNotice("");
    if (!isRegistered) {
      setChatNotice("Please sign in to your registered LCT account to chat.");
      return;
    }
    if (!current?.id || !message.trim()) {
      setChatNotice("Enter a message before sending.");
      return;
    }
    try {
      await sendChatMessage({
        streamId: current.id,
        body: { message: message.trim() },
      }).unwrap();
      setMessage("");
      setChatNotice("Message sent.");
    } catch (error: any) {
      setChatNotice(error?.data?.message ?? error?.data?.detail ??
        "Unable to send your message. Please confirm you are signed in and the broadcast is live.");
    }
  }

  async function submitLivePrayer(e: FormEvent) {
    e.preventDefault();
    setPrayerNotice("");
    if (!prayerContent.trim() || prayerContent.trim().length < 10) {
      setPrayerNotice("Please enter at least 10 characters for your prayer request.");
      return;
    }
    try {
      await submitPrayer({ content: prayerContent.trim(), visibility: prayerVisibility, anonymous: prayerAnonymous }).unwrap();
      setPrayerContent("");
      setPrayerNotice(prayerVisibility === "PRIVATE"
        ? "Your private prayer request has been sent to the church prayer team. It will not appear publicly."
        : "Your public prayer request has been received and can be seen on the church prayer wall.");
    } catch (error: any) {
      setPrayerNotice(error?.data?.message ?? error?.data?.detail ?? "We could not submit your prayer request. Please try again.");
    }
  }

  const chatPanel = isLive && current ? (
    <aside className="lct-live-chat" aria-labelledby="live-chat-title">
      <div className="section-heading">
        <h2 id="live-chat-title"><MessageCircle size={20} /> Live chat</h2>
        <span>{chatMessages.length} messages</span>
      </div>
      <p className="lct-live-chat__intro">Everyone can follow the conversation. Only registered members can send messages.</p>
      <div className="lct-live-chat__messages" aria-live="polite">
        {chatMessages.length === 0 ? <p className="empty">Be the first to say hello.</p> :
          chatMessages.map((item) => (
            <article key={item.id} className="lct-live-chat__message">
              <div>
                <strong>{item.senderName}</strong>
                <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
              </div>
              <p>{item.message}</p>
            </article>
          ))}
      </div>
      {isRegistered ? (
        <form onSubmit={submitChat} className="lct-live-chat__form">
          <label>Message
            <textarea maxLength={1000} rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Send a message to the congregation…" required />
          </label>
          <button className="button" type="submit" disabled={sendState.isLoading}>
            <Send size={16} /> {sendState.isLoading ? "Sending…" : "Send message"}
          </button>
          {chatNotice && <p role="status">{chatNotice}</p>}
        </form>
      ) : (
        <div className="lct-live-chat__signin">
          <p>Sign in to your registered account to join the chat.</p>
          <div><Link className="button" to="/login">Sign in</Link> <Link className="button secondary" to="/register">Register</Link></div>
        </div>
      )}
    </aside>
  ) : null;

  return (
    <main className="page">
      <div className="hero">
        <span className="eyebrow"><Radio size={15} /> LIFECHANGER TOUCH TV</span>
        <h1>Church TV</h1>
        <p>Experience services, special programs and the presence of God wherever you are.</p>
      </div>

      {isLive && current && (
        <div className="church-tv-chat-options">
          <button className="button secondary" type="button" onClick={() => setChatOnRight((value) => !value)} aria-pressed={chatOnRight}>
            <PanelRight size={17} /> {chatOnRight ? "Show chat below stream" : "Place chat beside stream"}
          </button>
        </div>
      )}

      <div className={isLive && chatOnRight ? "church-tv-layout church-tv-layout--with-chat" : "church-tv-layout"}>
        <section className="media-stage">
          {isLoading ? <div className="empty">Loading live channel…</div> :
            isLive && current ? <div>
              <div className="church-tv-player">
                {current.playbackUrl && /\.(mp4|webm|ogg)(\?.*)?$/i.test(current.playbackUrl) ? (
                  <video className="church-tv-player__media" src={current.playbackUrl} controls autoPlay playsInline>
                    Your browser does not support embedded video playback.
                  </video>
                ) : current.playbackUrl && youtubeEmbedUrl(current.playbackUrl) ? (
                  <iframe className="church-tv-player__media" src={youtubeEmbedUrl(current.playbackUrl)!} title={current.title}
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                ) : current.playbackUrl && facebookEmbedUrl(current.playbackUrl) ? (
                  <iframe className="church-tv-player__media" src={facebookEmbedUrl(current.playbackUrl)!} title={current.title}
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen; web-share" allowFullScreen />
                ) : current.playbackUrl && !isYouTubeUrl(current.playbackUrl) && !isFacebookUrl(current.playbackUrl) ? (
                  <iframe className="church-tv-player__media" src={current.playbackUrl} title={current.title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
                ) : current.playbackUrl && isYouTubeUrl(current.playbackUrl) ? (
                  <div className="video-placeholder"><PlayCircle size={64} /><span>VIDEO LINK NEEDS ATTENTION</span><p>Enter a valid public YouTube watch/live link in Church TV management.</p></div>
                ) : current.playbackUrl && isFacebookUrl(current.playbackUrl) ? (
                  <div className="video-placeholder"><PlayCircle size={64} /><span>FACEBOOK LINK NEEDS ATTENTION</span><p>Enter a public Facebook Watch or Live video permalink. The video must be available for public viewing and embedding.</p></div>
                ) : (
                  <div className="video-placeholder"><PlayCircle size={64} /><span>LIVE NOW</span><p>Stream playback URL has not been configured.</p></div>
                )}
              </div>
              <h2>{current.title}</h2><p>We are live. Join the service now.</p>
            </div> :
            current?.status === "SCHEDULED" ? <div>
              <div className="video-placeholder"><Radio size={64} /><span>NEXT BROADCAST</span></div>
              <h2>Our next broadcast is coming soon</h2><p>Join us when the service begins.</p>
              {countdown && <div aria-live="polite" className="church-tv-countdown"><span>Starting in</span><strong>{countdown}</strong></div>}
            </div> :
            <div className="empty"><Radio size={34} /><h3>We are currently offline</h3><p>Please check back for our next broadcast.</p></div>}
        </section>
        {chatOnRight && chatPanel}
      </div>
      {!chatOnRight && chatPanel}

      {isLive && current && (
        <section className="mt-6 rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="eyebrow">PRAYER & CARE</span>
              <h2 className="mt-2 text-xl font-black text-purple-950">Need prayer during the service?</h2>
              <p className="mt-1 text-sm text-slate-600">Share a request with the church prayer team while you watch.</p>
            </div>
            <button type="button" className="button secondary" aria-expanded={prayerOpen} onClick={() => setPrayerOpen(v => !v)}>
              <HeartHandshake size={17} /> {prayerOpen ? "Close prayer request" : "Request prayer"}
            </button>
          </div>
          {prayerOpen && (
            <form onSubmit={submitLivePrayer} className="mt-5 grid gap-4 md:max-w-3xl">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Your prayer request
                <textarea className="input min-h-32" minLength={10} maxLength={4000} required value={prayerContent}
                  onChange={e => setPrayerContent(e.target.value)} placeholder="Share what you would like us to pray about…" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 rounded-2xl border border-slate-200 p-4 text-sm font-semibold">
                  Who can see this request?
                  <select className="w-full bg-transparent" value={prayerVisibility} onChange={e => setPrayerVisibility(e.target.value as "PRIVATE" | "PUBLIC")}>
                    <option value="PRIVATE">Private — authorized prayer team only</option>
                    <option value="PUBLIC">Public — church family can see it</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-semibold">
                  <input type="checkbox" checked={prayerAnonymous} onChange={e => setPrayerAnonymous(e.target.checked)} />
                  Submit anonymously
                </label>
              </div>
              <p className="text-xs leading-5 text-slate-500">Private requests are not displayed in the public prayer wall. Please avoid including passwords or other sensitive account information.</p>
              <div className="flex flex-wrap items-center gap-3">
                <button className="button primary" type="submit" disabled={prayerState.isLoading}>
                  <Send size={16} /> {prayerState.isLoading ? "Sending request…" : "Send prayer request"}
                </button>
                {prayerNotice && <p className="text-sm font-semibold text-slate-700" role="status">{prayerNotice}</p>}
              </div>
            </form>
          )}
        </section>
      )}
      {isLive && current && (
        <section className="mt-6 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-purple-50 p-5 shadow-sm sm:p-6" aria-labelledby="live-giving-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"><Gift size={24} /></span>
              <div>
                <span className="eyebrow">LIVE GIVING</span>
                <h2 id="live-giving-title" className="mt-1 text-xl font-black text-purple-950">Partner with the work of the ministry</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">If you would like to give during this service, choose a giving fund and continue through LCT’s secure giving page. Payments are processed by Paystack or Flutterwave.</p>
              </div>
            </div>
            <Link to="/give" className="button primary inline-flex shrink-0 items-center justify-center gap-2"><Gift size={17} /> Give during this service</Link>
          </div>
          <div className="mt-5 border-t border-amber-100 pt-4">
            <h3 className="text-sm font-bold text-slate-800">Available giving funds</h3>
            {fundsLoading ? <p className="mt-2 text-sm text-slate-500">Loading available funds…</p> :
              fundsError ? <p className="mt-2 text-sm text-slate-600">Fund details are temporarily unavailable. You can still open the giving page to try again.</p> :
              givingFunds.length === 0 ? <p className="mt-2 text-sm text-slate-500">No active giving funds are currently available.</p> :
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {givingFunds.slice(0, 3).map((fund) => (
                  <li key={fund.id} className="rounded-xl border border-slate-200 bg-white/80 p-3">
                    <p className="font-semibold text-purple-950">{fund.name}</p>
                    {fund.description && <p className="mt-1 text-sm text-slate-600">{fund.description}</p>}
                  </li>
                ))}
              </ul>}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">This prompt is shown only while a broadcast is live. Starting a gift opens the existing giving flow; the Church TV page does not collect payment details or mark payments as successful.</p>
        </section>
      )}

    </main>
  );
}
