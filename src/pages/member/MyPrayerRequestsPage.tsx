import { Link } from 'react-router-dom'
import { HeartHandshake } from 'lucide-react'
import { useGetMyPrayerRequestsQuery } from '../../features/prayer/prayerApi'

export function MyPrayerRequestsPage() {
  const { data, isLoading, isError } = useGetMyPrayerRequestsQuery()
  return <main className="page"><section className="dashboard-hero"><div><p className="eyebrow">MY PRAYER JOURNEY</p><h1>Your prayer requests.</h1><p className="lead">Keep track of requests you have shared with the church.</p></div><Link to="/prayer" className="button primary"><HeartHandshake size={17}/> New request</Link></section>
    {isLoading ? <div className="card">Loading...</div> : isError ? <div className="card text-red-600">Unable to load your prayer requests.</div> : <div className="space-y-4">{(data?.data ?? []).map(p=><article key={p.id} className="card"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><span className="badge">{p.status.replaceAll('_',' ')}</span><span className="badge">{p.visibility}</span></div><span className="text-xs font-semibold text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{p.content}</p>{p.answeredAt && <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">Marked answered on {new Date(p.answeredAt).toLocaleDateString()}.</p>}</article>)}{(data?.data ?? []).length===0 && <div className="card">You have not submitted a prayer request yet.</div>}</div>}
  </main>
}
