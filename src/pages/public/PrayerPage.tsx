import { useState } from 'react'
import { HeartHandshake, Send } from 'lucide-react'
import { useGetPublicPrayerRequestsQuery, usePrayForRequestMutation, useSubmitPrayerRequestMutation } from '../../features/prayer/prayerApi'

export function PrayerPage() {
  const [content, setContent] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [visibility, setVisibility] = useState<'PRIVATE'|'PUBLIC'>('PRIVATE')
  const [anonymous, setAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const { data, isLoading } = useGetPublicPrayerRequestsQuery()
  const [submit, submitState] = useSubmitPrayerRequestMutation()
  const [pray] = usePrayForRequestMutation()
  const signedIn = Boolean(localStorage.getItem('lct_access_token'))

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault(); setMessage('')
    try { await submit({ content, name: name || undefined, email: email || undefined, visibility, anonymous }).unwrap(); setContent(''); setMessage('Your prayer request has been received. We are standing with you in prayer.') }
    catch { setMessage('We could not submit your prayer request. Please try again.') }
  }

  return <main className="page">
    <section className="dashboard-hero"><div><p className="eyebrow">PRAYER & COMMUNITY</p><h1>You don't have to carry it alone.</h1><p className="lead">Share what is on your heart. Our prayer team and church family can stand with you.</p></div><div className="grid size-14 place-items-center rounded-3xl bg-purple-100 text-purple-800"><HeartHandshake size={28}/></div></section>
    <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
      <form onSubmit={submitRequest} className="card space-y-4"><div><span className="badge">Send a prayer request</span><h2 className="mt-3 text-2xl font-black">Tell us what you need prayer for</h2></div>
        <input className="input" placeholder="Your name (optional)" value={name} onChange={e=>setName(e.target.value)}/>
        <input className="input" type="email" placeholder="Email (optional)" value={email} onChange={e=>setEmail(e.target.value)}/>
        <textarea className="input min-h-40" placeholder="Share your prayer request..." required minLength={10} maxLength={4000} value={content} onChange={e=>setContent(e.target.value)}/>
        <div className="grid gap-3 sm:grid-cols-2"><label className="rounded-2xl border border-slate-200 p-4"><span className="text-sm font-bold">Visibility</span><select className="mt-2 w-full bg-transparent text-sm" value={visibility} onChange={e=>setVisibility(e.target.value as 'PRIVATE'|'PUBLIC')}><option value="PRIVATE">Private — prayer team only</option><option value="PUBLIC">Public — church family can pray</option></select></label><label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-semibold"><input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)}/> Keep my name anonymous</label></div>
        <button disabled={submitState.isLoading} className="button primary"><Send size={17}/>{submitState.isLoading ? 'Sending...' : 'Submit prayer request'}</button>
        {message && <p className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700">{message}</p>}
      </form>
      <section className="space-y-4"><div><span className="badge">Church family</span><h2 className="mt-3 text-2xl font-black">Prayer wall</h2><p className="mt-1 text-sm text-slate-500">Public requests currently being carried in prayer.</p></div>
        {isLoading ? <div className="card">Loading prayer requests...</div> : (data?.data ?? []).length === 0 ? <div className="card"><p className="font-bold">No public prayer requests yet.</p><p className="mt-1 text-sm text-slate-500">Your request can be the first.</p></div> : (data?.data ?? []).map(p=><article key={p.id} className="card"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black text-purple-900">{p.requesterName}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{p.content}</p></div><span className="shrink-0 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-800">{p.prayerCount} prayers</span></div><button disabled={!signedIn} onClick={()=>pray(p.id)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-2 text-sm font-bold text-purple-800 disabled:cursor-not-allowed disabled:opacity-50"><HeartHandshake size={16}/> {signedIn ? 'I prayed' : 'Sign in to pray'}</button></article>)}
      </section>
    </div>
  </main>
}
