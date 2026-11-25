import { useMemo, useState } from 'react'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useChurchTvViewerAnalyticsQuery, useEngagementAnalyticsQuery } from '../../features/analytics/engagementApi'

const today = () => new Date().toISOString().slice(0,10)
const thirtyDaysAgo = () => { const d = new Date(); d.setUTCDate(d.getUTCDate()-29); return d.toISOString().slice(0,10) }
const count = (n: number) => Number(n || 0).toLocaleString('en-NG')
const duration = (seconds: number) => { const s = Math.max(0, Math.round(seconds || 0)); const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); return h ? `${h}h ${m}m` : `${m}m` }

export function EngagementAnalyticsPage() {
  const [from,setFrom] = useState(thirtyDaysAgo)
  const [to,setTo] = useState(today)
  const valid = from <= to
  const args = useMemo(() => ({from,to}),[from,to])
  const engagement = useEngagementAnalyticsQuery(args,{skip:!valid})
  const viewers = useChurchTvViewerAnalyticsQuery(args,{skip:!valid})
  const exportCsv = () => {
    const rows = [
      ['Date','Bible reading updates','Devotional journal entries','Reading-plan completions','Event registrations','Prayer requests','Church TV sessions'],
      ...(engagement.data?.daily ?? []).map(d => [d.date,d.bibleReadingUpdates,d.devotionalJournalEntries,d.readingPlanCompletions,d.eventRegistrations,d.prayerRequests,d.churchTvSessions]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})); const a=document.createElement('a'); a.href=url; a.download=`lct-engagement-${from}-to-${to}.csv`; a.click(); URL.revokeObjectURL(url)
  }
  const cards = [
    ['Total TV views', viewers.data?.totalSessions, 'Recorded viewing sessions'],
    ['Currently watching', viewers.data?.activeViewers ?? engagement.data?.activeChurchTvViewers, 'Active sessions in the last 90 seconds'],
    ['Total viewing time', viewers.data ? duration(viewers.data.totalViewSeconds) : '—', 'Estimated from session timestamps'],
    ['Average watch time', viewers.data ? duration(viewers.data.averageDurationSeconds) : '—', 'Per recorded session'],
    ['Bible reading updates', engagement.data?.bibleReadingUpdates, 'Saved reading progress updates'],
    ['Devotional journal entries', engagement.data?.devotionalJournalEntries, 'Entries created in this period'],
    ['Reading-plan completions', engagement.data?.readingPlanCompletions, 'Completed plan days'],
    ['Event registrations', engagement.data?.eventRegistrations, 'Active registrations created in this period'],
    ['Prayer requests', engagement.data?.prayerRequests, 'Requests submitted in this period'],
  ] as const
  return <div className="page">
    <div className="mb-6"><Link className="back" to="/dashboard"><ArrowLeft size={16}/> Back to dashboard</Link></div>
    <div className="hero compact"><span className="eyebrow">LEADERSHIP · V9-C</span><h1>Church engagement analytics</h1><p>Engagement indicators calculated from existing records. TV viewers are anonymous recorded sessions, not identified individuals.</p></div>
    <section className="card mb-6" aria-label="Report date range"><div className="flex flex-wrap items-end gap-4">
      <label className="grid gap-1">From date<input type="date" value={from} max={to} onChange={e=>setFrom(e.target.value)}/></label>
      <label className="grid gap-1">To date<input type="date" value={to} min={from} max={today()} onChange={e=>setTo(e.target.value)}/></label>
      <button type="button" className="button" onClick={()=>{void engagement.refetch();void viewers.refetch()}} disabled={!valid || engagement.isFetching || viewers.isFetching}><RefreshCw size={16}/> Refresh</button>
      <button type="button" className="button" onClick={exportCsv} disabled={!engagement.data}><Download size={16}/> Export CSV</button>
    </div>{!valid && <p className="error mt-3">The start date must be on or before the end date.</p>}</section>
    {(engagement.isError || viewers.isError) && <p className="error">One or more analytics reports could not load. Confirm your ENGAGEMENT_ANALYTICS_VIEW permission, SUPER_ADMIN role for Church TV analytics, and that the backend is running.</p>}
    {(engagement.isLoading || viewers.isLoading) && <p>Loading engagement analytics…</p>}
    <div className="cards">{cards.map(([label,value,help])=><section className="card" key={label}><span className="badge">{label}</span><h2>{typeof value === 'number' ? count(value) : value ?? '—'}</h2><p>{help}</p></section>)}</div>
    <div className="grid gap-6 mt-6 md:grid-cols-2">
      <section className="card"><h2>Church TV views by day</h2><p className="text-sm text-muted">Each session represents a browser viewing session.</p>{!viewers.data?.dailySessions.length ? <p>No viewing sessions in this period.</p> : <div className="admin-list">{viewers.data.dailySessions.map(d=><div className="admin-row" key={d.day}><strong>{d.day}</strong><strong>{count(d.sessions)} views</strong></div>)}</div>}</section>
      <section className="card"><h2>Engagement by day</h2><p className="text-sm text-muted">Counts reflect saved records, not unique people.</p>{!engagement.data?.daily.length ? <p>No engagement records in this period.</p> : <div className="admin-list">{engagement.data.daily.filter(d=>d.bibleReadingUpdates+d.devotionalJournalEntries+d.readingPlanCompletions+d.eventRegistrations+d.prayerRequests+d.churchTvSessions>0).map(d=><div className="admin-row" key={d.date}><div><strong>{d.date}</strong><small>Bible {d.bibleReadingUpdates} · Devotional {d.devotionalJournalEntries} · Plans {d.readingPlanCompletions}</small><small>Events {d.eventRegistrations} · Prayer {d.prayerRequests} · TV {d.churchTvSessions}</small></div></div>)}</div>}</section>
    </div>
  </div>
}
