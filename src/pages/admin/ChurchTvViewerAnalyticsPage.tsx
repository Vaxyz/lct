import { useMemo, useState } from "react";
import { ArrowLeft, Download, RefreshCw, Tv, Users, Clock3, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useChurchTvViewerAnalyticsQuery } from "../../features/analytics/engagementApi";

const today = () => new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = () => { const d = new Date(); d.setUTCDate(d.getUTCDate() - 29); return d.toISOString().slice(0, 10); };
const count = (n: number) => Number(n || 0).toLocaleString("en-NG");
const duration = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds || 0));
  const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
};
export function ChurchTvViewerAnalyticsPage() {
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);
  const valid = from <= to && to <= today();
  const args = useMemo(() => ({ from, to }), [from, to]);
  const report = useChurchTvViewerAnalyticsQuery(args, { skip: !valid });
  const exportCsv = () => {
    const rows = [["Date", "Viewing sessions"], ...(report.data?.dailySessions ?? []).map(d => [d.day, d.sessions])];
    const csv = rows.map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `lct-church-tv-analytics-${from}-to-${to}.csv`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  };
  const cards = [
    { label: "Total viewing sessions", value: report.data ? count(report.data.totalSessions) : "—", note: "Recorded sessions in the selected period", Icon: Tv },
    { label: "Currently watching", value: report.data ? count(report.data.activeViewers) : "—", note: "Sessions with a heartbeat in the last 90 seconds", Icon: Users },
    { label: "Total viewing time", value: report.data ? duration(report.data.totalViewSeconds) : "—", note: "Estimated from session timestamps", Icon: Clock3 },
    { label: "Average watch time", value: report.data ? duration(report.data.averageDurationSeconds) : "—", note: "Average per recorded session", Icon: Activity },
  ];
  const peak = Math.max(1, ...(report.data?.dailySessions ?? []).map(d => d.sessions));
  return <main className="page">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link className="back" to="/admin/church-tv"><ArrowLeft size={16}/> Back to Church TV management</Link><Link className="back" to="/admin/engagement-analytics">Church engagement analytics</Link></div>
    <div className="hero compact"><span className="eyebrow">CHURCH TV · V9-C</span><h1>Church TV viewer analytics</h1><p>Monitor recorded viewing sessions and viewing time. Sessions are anonymous browser sessions, not identified individuals.</p></div>
    <section className="card mb-6" aria-label="Report date range"><div className="flex flex-wrap items-end gap-4">
      <label className="grid gap-1">From date<input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} /></label>
      <label className="grid gap-1">To date<input type="date" value={to} min={from} max={today()} onChange={e => setTo(e.target.value)} /></label>
      <button type="button" className="button" onClick={() => void report.refetch()} disabled={!valid || report.isFetching}><RefreshCw size={16}/> Refresh</button>
      <button type="button" className="button" onClick={exportCsv} disabled={!report.data}><Download size={16}/> Export CSV</button>
    </div>{!valid && <p className="error mt-3">Choose a valid date range that does not extend into the future.</p>}</section>
    {report.isError && <section className="card error mb-5"><h2>Church TV analytics could not load</h2><p>Confirm that Flyway migration V16 created the viewer-session table, V17 granted ENGAGEMENT_ANALYTICS_VIEW, and the signed-in account has that permission. Then sign out and sign in again to refresh stored permissions.</p></section>}
    {report.isLoading && <p>Loading Church TV analytics…</p>}
    <div className="cards">{cards.map(({ label, value, note, Icon }) => <section className="card" key={label}><div className="flex items-center gap-2"><Icon size={18}/><span className="badge">{label}</span></div><h2>{value}</h2><p>{note}</p></section>)}</div>
    <section className="card mt-6"><h2>Viewing sessions by day</h2><p className="text-sm text-muted">A session is recorded when a viewer opens a live broadcast and sends periodic heartbeats.</p>
      {!report.isLoading && report.data?.dailySessions.length === 0 && <p>No viewing sessions were recorded in this period. Analytics only records sessions while a broadcast status is LIVE; older sessions are not reconstructed retroactively.</p>}
      {!!report.data?.dailySessions.length && <div className="admin-list mt-4">{report.data.dailySessions.map(d => <div className="admin-row" key={d.day}><div className="min-w-24"><strong>{d.day}</strong><small>{count(d.sessions)} sessions</small></div><div className="h-3 min-w-8 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-purple-700" style={{ width: `${Math.max(d.sessions ? 2 : 0, d.sessions / peak * 100)}%` }} /></div></div>)}</div>}
    </section>
  </main>;
}
