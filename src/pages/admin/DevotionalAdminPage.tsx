import { useMemo, useState } from 'react'
import { BookOpen, CalendarClock, Edit3, Plus, Search } from 'lucide-react'
import {
  type Devotional,
  type DevotionalStatus,
  useGetAdminDevotionalsQuery,
  useSaveDevotionalMutation,
  useUpdateDevotionalMutation,
} from '../../features/devotionals/devotionalsApi'

const statusLabels: Record<DevotionalStatus, string> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
}
const statusStyles: Record<DevotionalStatus, string> = {
  DRAFT: 'bg-amber-50 text-amber-800',
  SCHEDULED: 'bg-blue-50 text-blue-800',
  PUBLISHED: 'bg-emerald-50 text-emerald-800',
  ARCHIVED: 'bg-slate-100 text-slate-600',
}

const blankForm = {
  title: '',
  theme: '',
  scriptureReference: '',
  scriptureText: '',
  reflection: '',
  practicalApplication: '',
  prayer: '',
  status: 'DRAFT' as DevotionalStatus,
  publishAt: '',
}

export function DevotionalAdminPage() {
  const [form, setForm] = useState(blankForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<DevotionalStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const params = useMemo(() => ({ status: filter, q: search.trim() || undefined }), [filter, search])
  const list = useGetAdminDevotionalsQuery(params)
  const [createDevotional, createState] = useSaveDevotionalMutation()
  const [updateDevotional, updateState] = useUpdateDevotionalMutation()
  const isSaving = createState.isLoading || updateState.isLoading

  const change = (key: keyof typeof blankForm, value: string) => {
    setForm(current => ({ ...current, [key]: value }))
  }

  function edit(item: Devotional) {
    setEditingId(item.id)
    setForm({
      title: item.title ?? '',
      theme: item.theme ?? '',
      scriptureReference: item.scriptureReference ?? '',
      scriptureText: item.scriptureText ?? '',
      reflection: item.reflection ?? '',
      practicalApplication: item.practicalApplication ?? '',
      prayer: item.prayer ?? '',
      status: item.status ?? 'DRAFT',
      publishAt: item.publishAt ? item.publishAt.slice(0, 16) : '',
    })
    setMessage(`Editing “${item.title}”.`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId(null)
    setForm(blankForm)
  }

  async function submit() {
    setMessage('')
    const payload = {
      ...form,
      publishAt: form.publishAt ? new Date(form.publishAt).toISOString() : undefined,
    }
    try {
      if (editingId) {
        await updateDevotional({ id: editingId, body: payload }).unwrap()
        setMessage('Devotional updated successfully.')
      } else {
        await createDevotional(payload).unwrap()
        setMessage('Devotional created. It is now available in the management list below.')
      }
      resetForm()
      list.refetch()
    } catch (error) {
      setMessage('Unable to save. Check required fields, your permissions, duplicate title/slug, and the backend response.')
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-purple-700">Content administration</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Devotional management</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Create drafts, return to unfinished work, schedule publication, and manage live devotionals.</p>
        </div>
        <button type="button" onClick={() => { resetForm(); setMessage('New devotional draft.') }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-800 px-4 py-3 font-bold text-white hover:bg-purple-900">
          <Plus size={18} /> New devotional
        </button>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">{editingId ? 'Edit devotional' : 'Create devotional'}</h2>
            <p className="mt-1 text-sm text-slate-500">Drafts are saved and listed below until you are ready to publish.</p>
          </div>
          {editingId && <button type="button" onClick={() => { resetForm(); setMessage('Edit cancelled.') }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold">Cancel edit</button>}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Title" value={form.title} onChange={v => change('title', v)} required />
          <Field label="Theme" value={form.theme} onChange={v => change('theme', v)} />
          <Field label="Bible reference" value={form.scriptureReference} onChange={v => change('scriptureReference', v)} required />
          <Field label="Publication date/time (optional)" value={form.publishAt} onChange={v => change('publishAt', v)} type="datetime-local" />
          <TextField label="Scripture text" value={form.scriptureText} onChange={v => change('scriptureText', v)} />
          <TextField label="Reflection *" value={form.reflection} onChange={v => change('reflection', v)} required />
          <TextField label="Practical application" value={form.practicalApplication} onChange={v => change('practicalApplication', v)} />
          <TextField label="Prayer" value={form.prayer} onChange={v => change('prayer', v)} />
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Publication status
            <select className="rounded-xl border border-slate-200 p-3 font-normal" value={form.status} onChange={e => change('status', e.target.value as DevotionalStatus)}>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button type="button" onClick={submit} disabled={isSaving || !form.title.trim() || !form.scriptureReference.trim() || !form.reflection.trim()} className="rounded-xl bg-purple-800 px-5 py-3 font-bold text-white disabled:opacity-50">
              {isSaving ? 'Saving…' : editingId ? 'Update devotional' : 'Save devotional'}
            </button>
          </div>
        </div>
        {message && <p role="status" className="mt-4 rounded-xl bg-purple-50 p-3 text-sm text-purple-900">{message}</p>}
      </section>

      <section className="mt-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Saved devotionals</h2>
            <p className="mt-1 text-sm text-slate-500">Your drafts remain here so you can edit and publish them later.</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Search size={17} className="text-slate-400" />
            <input aria-label="Search saved devotionals" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or Scripture" className="min-w-0 outline-none" />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(['ALL', 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'] as const).map(value => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === value ? 'bg-purple-800 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-purple-300'}`}>
              {value === 'ALL' ? 'All statuses' : statusLabels[value]}
            </button>
          ))}
        </div>

        {list.isLoading ? <p className="py-8 text-slate-500">Loading saved devotionals…</p>
          : list.isError ? <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Unable to load the management list. Confirm the backend includes the admin listing endpoint and your account has DEVOTIONAL_MANAGE.</div>
          : (list.data?.data.length ?? 0) === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><BookOpen className="mx-auto text-purple-700" size={28} /><h3 className="mt-3 font-bold text-slate-900">No devotionals in this view yet</h3><p className="mt-1 text-sm text-slate-500">Create a devotional above, or choose another status filter.</p></div>
          : <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {list.data!.data.map(item => {
              const itemStatus = item.status ?? 'DRAFT'
              return <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h3 className="font-black text-slate-900">{item.title}</h3><p className="mt-1 text-sm font-semibold text-amber-800">{item.scriptureReference}</p><p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.reflection}</p></div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[itemStatus]}`}>{statusLabels[itemStatus]}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div className="text-xs text-slate-500">{item.publishAt ? <span className="inline-flex items-center gap-1"><CalendarClock size={14} /> {new Date(item.publishAt).toLocaleString()}</span> : 'No publication time set'}</div>
                  <button type="button" onClick={() => edit(item)} className="inline-flex items-center gap-2 rounded-lg border border-purple-200 px-3 py-2 text-sm font-bold text-purple-800 hover:bg-purple-50"><Edit3 size={15} /> Edit / publish</button>
                </div>
              </article>
            })}
          </div>}
      </section>
    </main>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="grid gap-1 text-sm font-semibold text-slate-700">{label}{required ? ' *' : ''}<input type={type} required={required} className="rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-purple-500" value={value} onChange={e => onChange(e.target.value)} /></label>
}

function TextField({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label className="grid gap-1 text-sm font-semibold text-slate-700 sm:col-span-2">{label}<textarea required={required} className="min-h-24 rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-purple-500" value={value} onChange={e => onChange(e.target.value)} /></label>
}
