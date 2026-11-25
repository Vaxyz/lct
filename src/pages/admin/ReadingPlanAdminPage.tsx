import { useState } from 'react'
import {
  useAddReadingPlanDayMutation,
  useGetAdminReadingPlansQuery,
  useSaveReadingPlanMutation,
  useUpdateReadingPlanMutation,
  type AdminReadingPlan,
} from '../../features/devotionals/devotionalsApi'

type PlanStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export function ReadingPlanAdminPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationDays, setDurationDays] = useState(7)
  const [status, setStatus] = useState<PlanStatus>('DRAFT')
  const [planId, setPlanId] = useState('')
  const [dayNumber, setDayNumber] = useState(1)
  const [scriptureReference, setScriptureReference] = useState('')
  const [reflectionPrompt, setReflectionPrompt] = useState('')
  const [message, setMessage] = useState('')
  const { data, isLoading, isError, refetch } = useGetAdminReadingPlansQuery()
  const [savePlan, { isLoading: planLoading }] = useSaveReadingPlanMutation()
  const [updatePlan, { isLoading: updateLoading }] = useUpdateReadingPlanMutation()
  const [addDay, { isLoading: dayLoading }] = useAddReadingPlanDayMutation()
  const plans = data?.data ?? []
  const editing = Boolean(planId)

  function selectPlan(plan: AdminReadingPlan) {
    setPlanId(plan.id)
    setTitle(plan.title)
    setDescription(plan.description ?? '')
    setDurationDays(plan.durationDays)
    setStatus(plan.status)
    setDayNumber(Math.min(Math.max(1, (plan.configuredDays ?? 0) + 1), plan.durationDays))
    setMessage(`Editing “${plan.title}”. Save changes to update this plan.`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setPlanId(''); setTitle(''); setDescription(''); setDurationDays(7); setStatus('DRAFT')
    setDayNumber(1); setScriptureReference(''); setReflectionPrompt(''); setMessage('')
  }

  async function savePlanDetails() {
    setMessage('')
    const body = { title: title.trim(), description: description.trim(), durationDays, status }
    try {
      if (editing) {
        await updatePlan({ id: planId, ...body }).unwrap()
        setMessage('Reading plan updated successfully.')
      } else {
        const result = await savePlan(body).unwrap()
        setPlanId(result.data.id)
        setMessage('Reading plan created. You can now add its daily readings.')
      }
      await refetch()
    } catch {
      setMessage('Unable to save the reading plan. Check your permission, title, duration, and status.')
    }
  }

  async function saveDay() {
    setMessage('')
    try {
      await addDay({ id: planId, dayNumber, scriptureReference, reflectionPrompt }).unwrap()
      setMessage(`Day ${dayNumber} saved to the plan.`)
      setDayNumber(n => Math.min(durationDays, n + 1))
      setScriptureReference(''); setReflectionPrompt('')
      await refetch()
    } catch {
      setMessage('Unable to save this plan day. The day may already exist; editing existing day content is not supported by this endpoint yet.')
    }
  }

  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <h1 className="text-3xl font-bold text-slate-950">Reading plan management</h1>
    <p className="mt-2 text-slate-600">Create plans, edit existing plans, change their publication status, and configure daily readings.</p>
    <section className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{editing ? 'Edit reading plan' : '1. Create a plan'}</h2>{editing && <button type="button" onClick={resetForm} className="rounded-lg border px-3 py-2 text-sm font-semibold">Create another plan</button>}</div>
      <Field label="Plan title" value={title} onChange={setTitle}/>
      <Field label="Description" value={description} onChange={setDescription}/>
      <label className="grid gap-1 text-sm font-semibold">Duration (days)<input type="number" min={1} max={730} className="rounded-xl border border-slate-200 p-3 font-normal" value={durationDays} onChange={e => setDurationDays(Number(e.target.value))}/></label>
      <label className="grid gap-1 text-sm font-semibold">Status<select className="rounded-xl border border-slate-200 p-3 font-normal" value={status} onChange={e => setStatus(e.target.value as PlanStatus)}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></label>
      <div className="flex flex-wrap gap-3"><button disabled={planLoading || updateLoading || !title.trim() || durationDays < 1 || durationDays > 730} onClick={savePlanDetails} className="rounded-xl bg-purple-800 px-5 py-3 font-semibold text-white disabled:opacity-50">{planLoading || updateLoading ? 'Saving…' : editing ? 'Save changes' : 'Create reading plan'}</button>{editing && <span className="self-center text-sm text-slate-500">Plan ID: {planId}</span>}</div>
    </section>
    {editing && <section className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">Add a day to this plan</h2><label className="grid gap-1 text-sm font-semibold">Day number<input type="number" min={1} max={durationDays} className="rounded-xl border border-slate-200 p-3 font-normal" value={dayNumber} onChange={e => setDayNumber(Number(e.target.value))}/></label><Field label="Scripture reference" value={scriptureReference} onChange={setScriptureReference}/><label className="grid gap-1 text-sm font-semibold">Reflection prompt<textarea className="min-h-24 rounded-xl border border-slate-200 p-3 font-normal" value={reflectionPrompt} onChange={e => setReflectionPrompt(e.target.value)}/></label><button disabled={dayLoading || dayNumber < 1 || dayNumber > durationDays || !scriptureReference.trim()} onClick={saveDay} className="justify-self-start rounded-xl bg-purple-800 px-5 py-3 font-semibold text-white disabled:opacity-50">{dayLoading ? 'Saving…' : 'Save plan day'}</button></section>}
    {message && <p role="status" className="mt-4 rounded-lg bg-purple-50 p-3 text-sm text-purple-950">{message}</p>}
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Existing reading plans</h2><button onClick={() => void refetch()} className="rounded-lg border px-3 py-2 text-sm font-semibold">Refresh list</button></div>
      {isLoading ? <p className="mt-4 text-slate-600">Loading reading plans…</p> : isError ? <p role="alert" className="mt-4 text-red-700">Could not load plans. Check that the backend is running and your account has DEVOTIONAL_MANAGE permission.</p> : plans.length === 0 ? <p className="mt-4 text-slate-600">No plans have been created yet.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-3">Plan</th><th className="p-3">Duration</th><th className="p-3">Configured days</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead><tbody>{plans.map(plan => <tr key={plan.id} className="border-b last:border-0"><td className="p-3"><p className="font-semibold text-slate-900">{plan.title}</p><p className="max-w-xs truncate text-xs text-slate-500">{plan.description || 'No description'}</p></td><td className="p-3">{plan.durationDays} days</td><td className="p-3">{plan.configuredDays ?? 0} / {plan.durationDays}</td><td className="p-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{plan.status}</span></td><td className="p-3"><button onClick={() => selectPlan(plan)} className="rounded-lg bg-purple-800 px-3 py-2 font-semibold text-white">Edit</button></td></tr>)}</tbody></table></div>}
    </section>
  </main>
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <label className="grid gap-1 text-sm font-semibold">{label}<input className="rounded-xl border border-slate-200 p-3 font-normal" value={value} onChange={e => onChange(e.target.value)}/></label>
}
