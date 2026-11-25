import { useMemo, useState } from 'react'
import { Pagination } from '../../components/ui/Pagination'
import { BookOpen, CalendarDays, Heart, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetDevotionalsQuery, useGetReadingPlansQuery } from '../../features/devotionals/devotionalsApi'

function canManageDevotionals() {
  try {
    const user = JSON.parse(localStorage.getItem('lct_user') ?? 'null') as { permissions?: string[] } | null
    return Boolean(user?.permissions?.includes('DEVOTIONAL_MANAGE'))
  } catch {
    return false
  }
}

export function DevotionalsPage() {
  const [q, setQ] = useState('')
  const [theme, setTheme] = useState('')
  const [devotionalPage, setDevotionalPage] = useState(1)
  const [planPage, setPlanPage] = useState(1)
  const devotionalPageSize = 6
  const planPageSize = 4
  const query = useMemo(() => ({ q: q.trim() || undefined, theme: theme.trim() || undefined }), [q, theme])
  const devotionals = useGetDevotionalsQuery(query)
  const plans = useGetReadingPlansQuery()
  const showAdminLink = canManageDevotionals()
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-purple-900 to-amber-800 p-8 text-white sm:p-12">
      <p className="text-sm font-bold uppercase tracking-[.22em] text-amber-200">Pause • Reflect • Grow</p>
      <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Daily devotionals for a life rooted in the Word.</h1>
      <p className="mt-4 max-w-2xl text-purple-100">Make space for Scripture, reflection, prayer, and practical steps of faith in your everyday life.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link to="/devotionals/journal" className="rounded-xl bg-white px-5 py-3 font-semibold text-purple-950 hover:bg-purple-50">My devotional journal</Link><Link to="/bible" className="rounded-xl border border-white/40 px-5 py-3 font-semibold hover:bg-white/10">Open Bible</Link>{showAdminLink && <Link to="/admin/devotionals" className="rounded-xl border border-amber-200/70 bg-amber-300 px-5 py-3 font-semibold text-purple-950 hover:bg-amber-200">Create / manage devotionals</Link>}</div>
    </section>
    <section className="mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wider text-purple-800">Daily nourishment</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Latest devotionals</h2></div><div className="flex flex-col gap-2 sm:flex-row"><label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2"><Search size={17} className="text-slate-400"/><input aria-label="Search devotionals" className="min-w-0 outline-none" placeholder="Search devotionals" value={q} onChange={e=>{setQ(e.target.value);setDevotionalPage(1)}}/></label><input aria-label="Filter by theme" className="rounded-xl border border-slate-200 px-3 py-2 outline-none" placeholder="Filter by theme" value={theme} onChange={e=>{setTheme(e.target.value);setDevotionalPage(1)}}/></div></div>
      {devotionals.isLoading ? <p className="py-10 text-slate-500">Loading devotionals…</p> : devotionals.isError ? <p role="alert" className="py-10 text-rose-700">We couldn't load devotionals. Please try again.</p> : (devotionals.data?.data.length ?? 0) === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center"><BookOpen className="mx-auto text-purple-700"/><h3 className="mt-3 font-semibold text-slate-900">Your next reflection is on its way</h3><p className="mt-1 text-sm text-slate-500">No published devotionals match this search yet.</p></div> : <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{devotionals.data!.data.slice((devotionalPage-1)*devotionalPageSize, devotionalPage*devotionalPageSize).map(item=><article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800">{item.theme || 'Daily devotional'}</span><CalendarDays size={17} className="text-slate-400"/></div><h3 className="mt-4 text-xl font-bold text-slate-900">{item.title}</h3><p className="mt-2 text-sm font-semibold text-amber-800">{item.scriptureReference}</p>{item.scriptureText && <blockquote className="mt-3 border-l-2 border-amber-400 pl-3 text-sm italic leading-6 text-slate-600">{item.scriptureText}</blockquote>}<p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">{item.reflection}</p><div className="mt-auto pt-5"><Link to={`/devotionals/${item.slug}`} className="font-semibold text-purple-800 hover:text-purple-950">Read devotional →</Link></div></article>)}</div>}
      <Pagination page={devotionalPage} pageSize={devotionalPageSize} totalItems={devotionals.data?.data.length ?? 0} onPageChange={setDevotionalPage} label="devotionals"/>
    </section>
    <section className="mt-12"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-3 text-amber-800"><Heart/></div><div><h2 className="text-2xl font-bold text-slate-900">Reading plans</h2><p className="text-sm text-slate-500">Build a steady rhythm with Scripture day by day.</p></div></div>{plans.isLoading ? <p className="py-6 text-slate-500">Loading reading plans…</p> : (plans.data?.data.length ?? 0)===0 ? <p className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">Reading plans will appear here when published by the church team.</p> : <div className="mt-5 grid gap-4 md:grid-cols-2">{plans.data!.data.slice((planPage-1)*planPageSize, planPage*planPageSize).map(plan=><article key={plan.id} className="rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-slate-900">{plan.title}</h3><p className="mt-1 text-sm text-slate-600">{plan.description}</p><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-purple-800">{plan.durationDays} days</p><Link to={`/reading-plans/${plan.id}`} className="mt-4 inline-flex font-semibold text-purple-800 hover:text-purple-950">Open reading plan →</Link></article>)}</div>}<Pagination page={planPage} pageSize={planPageSize} totalItems={plans.data?.data.length ?? 0} onPageChange={setPlanPage} label="reading plans"/></section>
  </main>
}
