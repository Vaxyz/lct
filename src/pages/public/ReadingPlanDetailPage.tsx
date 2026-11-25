import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, CheckCircle2, Circle, Clock3, LockKeyhole, PlayCircle } from 'lucide-react'
import {
  useCompleteReadingDayMutation,
  useGetReadingPlanQuery,
  useGetReadingProgressQuery,
} from '../../features/devotionals/devotionalsApi'

export function ReadingPlanDetailPage() {
  const { id = '' } = useParams()
  const plan = useGetReadingPlanQuery(id, { skip: !id })
  const signedIn = Boolean(localStorage.getItem('lct_access_token'))
  const progress = useGetReadingProgressQuery(id, { skip: !id || !signedIn })
  const [completeDay, completion] = useCompleteReadingDayMutation()
  const history = progress.data?.data ?? []
  const completedDays = useMemo(() => new Set(history.map(item => item.dayNumber)), [history])
  const item = plan.data?.data
  const duration = item?.durationDays ?? 0
  const count = completedDays.size
  const percentage = duration ? Math.min(100, Math.round((count / duration) * 100)) : 0
  const days = item?.days ?? []
  const nextDay = Array.from({ length: duration }, (_, index) => index + 1).find(day => !completedDays.has(day))

  async function markComplete(day: number) {
    try {
      await completeDay({ planId: id, day }).unwrap()
    } catch {
      // The mutation error is presented inline so the member can retry.
    }
  }

  function continueReading() {
    const target = nextDay ?? duration
    document.getElementById(`reading-plan-day-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (plan.isLoading) return <main className="mx-auto max-w-4xl px-4 py-10" aria-live="polite">Loading reading plan…</main>
  if (plan.isError || !item) return <main className="mx-auto max-w-4xl px-4 py-10"><h1 className="text-2xl font-bold">Reading plan unavailable</h1><p className="mt-2 text-slate-600">This plan may have been unpublished, removed, or the link may be incorrect.</p><Link className="mt-4 inline-block text-purple-800 underline" to="/devotionals">Back to devotionals</Link></main>

  return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
    <Link to="/devotionals" className="text-sm font-semibold text-purple-800 hover:underline">← Back to devotionals</Link>

    <header className="mt-5 rounded-3xl bg-gradient-to-br from-purple-950 via-purple-900 to-amber-800 p-7 text-white sm:p-10">
      <div className="flex items-center gap-3 text-amber-200"><BookOpen aria-hidden="true"/><span className="text-sm font-semibold uppercase tracking-wider">Bible reading plan</span></div>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{item.title}</h1>
      <p className="mt-3 text-purple-100">{item.description || 'Spend intentional time in Scripture, one day at a time.'}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold"><span>{duration} days</span><span>{signedIn ? `${count} of ${duration} days completed` : 'Track your progress when signed in'}</span></div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-label="Reading plan completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={signedIn ? percentage : 0}><div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${signedIn ? percentage : 0}%` }}/></div>
      {signedIn && <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-purple-100">{percentage}% complete</span><button type="button" onClick={continueReading} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-purple-950 hover:bg-purple-50"><PlayCircle size={18}/>{count === duration && duration > 0 ? 'Review completed plan' : 'Continue reading'}</button></div>}
    </header>

    {!signedIn && <p className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><LockKeyhole size={18} className="mt-0.5 shrink-0"/><span>You can read the plan below. <Link to="/login" className="font-bold underline">Sign in</Link> to mark days complete and save your progress across visits.</span></p>}
    {progress.isLoading && signedIn && <p className="mt-4 text-sm text-slate-500" aria-live="polite">Loading your reading progress…</p>}
    {progress.isError && signedIn && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">Your progress could not be loaded. Please check your connection, sign in again if needed, and retry.</p>}
    {completion.isError && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">We could not save that completion. Please try again.</p>}

    <section className="mt-8" aria-labelledby="daily-readings-heading">
      <div className="mb-4"><h2 id="daily-readings-heading" className="text-2xl font-bold text-slate-950">Daily Scripture readings</h2><p className="mt-1 text-sm text-slate-600">Read the passage, reflect on the prompt, and record each day as you complete it.</p></div>
      {Array.from({ length: duration }, (_, index) => {
        const day = index + 1
        const reading = days.find(d => d.dayNumber === day)
        const done = completedDays.has(day)
        const record = history.find(entry => entry.dayNumber === day)
        return <article id={`reading-plan-day-${day}`} key={day} className={`mb-3 scroll-mt-24 rounded-2xl border p-5 shadow-sm ${done ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-purple-800">{done ? <CheckCircle2 aria-label="Completed"/> : <Circle aria-label="Not completed"/>}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold uppercase tracking-wider text-purple-800">Day {day}</p>{done && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Completed</span>}</div>
              <h3 className="mt-1 font-bold text-slate-950">{reading?.scriptureReference || 'Scripture reading to be added'}</h3>
              {reading?.reflectionPrompt ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{reading.reflectionPrompt}</p> : <p className="mt-2 text-sm text-slate-500">A reflection prompt has not been added for this day yet.</p>}
              {done && record?.completedAt && <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-800"><Clock3 size={14}/>Completed {new Date(record.completedAt).toLocaleString()}</p>}
            </div>
            {signedIn && <button type="button" disabled={done || completion.isLoading || progress.isLoading || progress.isError} onClick={() => void markComplete(day)} className="shrink-0 rounded-lg bg-purple-800 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-950 disabled:cursor-not-allowed disabled:opacity-50">{done ? 'Completed' : completion.isLoading ? 'Saving…' : 'Mark complete'}</button>}
          </div>
        </article>
      })}
    </section>

    {signedIn && <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="history-heading">
      <h2 id="history-heading" className="text-xl font-bold text-slate-950">Completion history</h2>
      {progress.isLoading ? <p className="mt-3 text-sm text-slate-500">Loading history…</p> : history.length === 0 ? <p className="mt-3 text-sm text-slate-600">You haven’t completed any days yet. Your completed readings will appear here.</p> : <ol className="mt-3 divide-y divide-slate-100">{[...history].sort((a, b) => b.dayNumber - a.dayNumber).map(entry => <li key={entry.dayNumber} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span className="font-semibold text-slate-800">Day {entry.dayNumber}{days.find(day => day.dayNumber === entry.dayNumber)?.scriptureReference ? ` · ${days.find(day => day.dayNumber === entry.dayNumber)?.scriptureReference}` : ''}</span><span className="text-slate-500">{new Date(entry.completedAt).toLocaleString()}</span></li>)}</ol>}
    </section>}
  </main>
}
