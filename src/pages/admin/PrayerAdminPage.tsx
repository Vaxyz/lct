import { useState } from 'react'
import { ArrowLeft, HeartHandshake } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetAdminPrayerRequestsQuery, useUpdatePrayerRequestMutation } from '../../features/prayer/prayerApi'

export function PrayerAdminPage() {
  const { data, isLoading, isError, error } = useGetAdminPrayerRequestsQuery(undefined, { pollingInterval: 5000, refetchOnFocus: true, refetchOnMountOrArgChange: true })
  const [update] = useUpdatePrayerRequestMutation()
  const [note, setNote] = useState<Record<string,string>>({})
  async function change(id:string,status:any){ await update({id,body:{status,adminNote:note[id]}}).unwrap() }
  return <main className="page"><section className="dashboard-hero"><div><p className="eyebrow">PRAYER ADMINISTRATION</p><h1>Care for every request.</h1><p className="lead">Review requests, move them through the prayer workflow and record pastoral notes.</p></div><Link to="/dashboard" className="button secondary"><ArrowLeft size={17}/> Dashboard</Link></section>
    {isLoading ? <div className="card">Loading prayer requests...</div> : isError ? <div className="card" role="alert"><h2 className="font-black">Could not load prayer requests.</h2><p className="mt-2 text-sm text-slate-600">{(error as any)?.data?.message ?? (error as any)?.data?.detail ?? "Please confirm that your account has PRAYER_MANAGE permission and try refreshing the page."}</p></div> : <div className="space-y-4">{(data?.data ?? []).map(p=><article key={p.id} className="card"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><span className="badge">{p.status}</span><span className="badge">{p.visibility}</span>{p.anonymous && <span className="badge">Anonymous</span>}</div><h2 className="mt-3 font-black">{p.requesterName}</h2><p className="mt-1 text-xs text-slate-400">{new Date(p.createdAt).toLocaleString()} · {p.prayerCount} prayers</p></div></div><p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">{p.content}</p><textarea className="input mt-5 min-h-24" placeholder="Pastoral/admin note" value={note[p.id] ?? p.adminNote ?? ''} onChange={e=>setNote({...note,[p.id]:e.target.value})}/><div className="mt-4 flex flex-wrap gap-2">{p.status==='NEW' && <button onClick={()=>change(p.id,'IN_PRAYER')} className="button primary"><HeartHandshake size={16}/> Take into prayer</button>}{p.status==='IN_PRAYER' && <button onClick={()=>change(p.id,'ANSWERED')} className="button primary">Mark answered</button>}{p.status!=='ARCHIVED' && <button onClick={()=>change(p.id,'ARCHIVED')} className="button secondary">Archive</button>}</div></article>)}{(data?.data ?? []).length===0 && <div className="card">No prayer requests.</div>}</div>}
  </main>
}
