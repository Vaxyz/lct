import { useMemo, useState } from "react";
import { Activity, ArrowRight, BookOpen, CalendarDays, HeartHandshake, RefreshCw, ShieldAlert, Tv, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useGivingAnalyticsQuery } from "../../features/giving/givingApi";
import { useEngagementAnalyticsQuery, useChurchTvViewerAnalyticsQuery } from "../../features/analytics/engagementApi";

const today = () => new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = () => { const d = new Date(); d.setUTCDate(d.getUTCDate() - 29); return d.toISOString().slice(0, 10); };
const count = (value?: number) => Number(value ?? 0).toLocaleString("en-NG");
const money = (value?: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(value ?? 0));
const duration = (value?: number) => { const s = Math.max(0, Math.round(Number(value ?? 0))); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60; return h ? `${h}h ${m}m` : m ? `${m}m ${sec}s` : `${sec}s`; };

function Metric({ label, value, note, Icon, href }: { label: string; value: string; note: string; Icon: typeof Activity; href: string }) {
  return <Link to={href} className="card group block transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between gap-3"><span className="badge">{label}</span><Icon size={20} className="text-purple-800" /></div><h2 className="mt-4 text-2xl font-black">{value}</h2><p className="mt-1 text-sm text-slate-500">{note}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-purple-800">View report <ArrowRight size={15}/></span></Link>;
}

export function LeadershipDashboardPage() {
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);
  const valid = from <= to && to <= today();
  const args = useMemo(() => ({ from, to }), [from, to]);
  const giving = useGivingAnalyticsQuery(args, { skip: !valid });
  const engagement = useEngagementAnalyticsQuery(args, { skip: !valid });
  const viewers = useChurchTvViewerAnalyticsQuery(args, { skip: !valid });
  const anyError = giving.isError || engagement.isError || viewers.isError;
  const anyLoading = giving.isLoading || engagement.isLoading || viewers.isLoading;
  const refresh = () => { if (!valid) return; void giving.refetch(); void engagement.refetch(); void viewers.refetch(); };

  return <main className="page">
    <div className="hero compact"><span className="eyebrow">LCT · V9-D</span><h1>Leadership dashboard</h1><p>A date-filtered overview of giving, Church TV, and church engagement. Select any card to open its detailed report.</p></div>
    <section className="card mb-6" aria-label="Dashboard date range"><div className="flex flex-wrap items-end gap-4">
      <label className="grid gap-1">From date<input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} /></label>
      <label className="grid gap-1">To date<input type="date" value={to} min={from} max={today()} onChange={e => setTo(e.target.value)} /></label>
      <button type="button" className="button" onClick={refresh} disabled={!valid || anyLoading}><RefreshCw size={16}/> Refresh reports</button>
    </div>{!valid && <p className="error mt-3">Choose a valid date range that does not extend into the future.</p>}</section>
    {anyError && <section className="card mb-5 border border-amber-200"><div className="flex items-start gap-3"><ShieldAlert size={20} className="mt-1 text-amber-700"/><div><h2 className="font-bold">Some reports could not load</h2><p className="mt-1 text-sm text-slate-600">Available summaries remain visible. Check the relevant report permission and backend response for any unavailable section. This dashboard does not bypass API authorization.</p></div></div></section>}
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="eyebrow">LEADERSHIP OVERVIEW</p><h2 className="text-xl font-black">Summary for {from} to {to}</h2></div><span className="text-sm text-slate-500">{anyLoading ? "Refreshing…" : "Based on existing reports"}</span></div>
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <Metric label="Successful giving" value={giving.data ? money(giving.data.successfulAmount) : giving.isError ? "Unavailable" : "—"} note={`${count(giving.data?.successfulTransactions)} successful transactions`} Icon={Wallet} href="/admin/giving" />
      <Metric label="Pending giving" value={giving.data ? count(giving.data.pendingTransactions) : giving.isError ? "Unavailable" : "—"} note={`${count(giving.data?.failedTransactions)} failed transactions in this period`} Icon={Activity} href="/admin/giving" />
      <Metric label="TV viewing sessions" value={viewers.data ? count(viewers.data.totalSessions) : viewers.isError ? "Unavailable" : "—"} note={`${count(viewers.data?.activeViewers)} active sessions right now`} Icon={Tv} href="/admin/church-tv/analytics" />
      <Metric label="Total TV viewing time" value={viewers.data ? duration(viewers.data.totalViewSeconds) : viewers.isError ? "Unavailable" : "—"} note={viewers.data ? `Average session ${duration(viewers.data.averageDurationSeconds)}` : "Recorded viewing time"} Icon={Tv} href="/admin/church-tv/analytics" />
      <Metric label="Bible & devotional activity" value={engagement.data ? count(engagement.data.bibleReadingUpdates + engagement.data.devotionalJournalEntries + engagement.data.readingPlanCompletions) : engagement.isError ? "Unavailable" : "—"} note="Reading updates, journal entries and completed plan days" Icon={BookOpen} href="/admin/engagement-analytics" />
      <Metric label="Event registrations" value={engagement.data ? count(engagement.data.eventRegistrations) : engagement.isError ? "Unavailable" : "—"} note={`${count(engagement.data?.prayerRequests)} prayer requests submitted`} Icon={CalendarDays} href="/admin/engagement-analytics" />
    </section>
    <section className="mt-6 grid gap-5 md:grid-cols-2">
      <div className="card"><div className="flex items-center gap-2"><HeartHandshake size={20}/><h2 className="font-black">Church engagement</h2></div><p className="mt-2 text-sm text-slate-500">Review Bible reading, devotionals, reading plans, events, prayer and Church TV activity.</p><Link className="button mt-4 inline-flex" to="/admin/engagement-analytics">Open engagement report <ArrowRight size={16}/></Link></div>
      <div className="card"><div className="flex items-center gap-2"><Wallet size={20}/><h2 className="font-black">Financial oversight</h2></div><p className="mt-2 text-sm text-slate-500">View giving trends, payment statuses, providers and fund breakdowns.</p><Link className="button mt-4 inline-flex" to="/admin/giving">Open giving report <ArrowRight size={16}/></Link></div>
    </section>
    <p className="mt-5 text-xs text-slate-500">Note: Church TV values reflect recorded anonymous browser sessions, not verified unique people. If viewer tracking did not record a session, the dashboard cannot infer it.</p>
  </main>;
}
