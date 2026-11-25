import { useEffect, useState } from 'react'
import { Bell, Mail, Save } from 'lucide-react'
import { useGetNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation, type NotificationPreference } from '../../features/notifications/notificationsApi'
const labels: Record<NotificationPreference['category'], {title:string;description:string}> = {
 ANNOUNCEMENTS:{title:'Church announcements',description:'Church-wide and role-targeted notices.'},
 EVENTS:{title:'Events',description:'Event reminders and event-related updates.'},
 DEVOTIONALS:{title:'Devotionals',description:'Devotional publishing and related updates.'},
 BIBLE_STUDIES:{title:'Bible studies and reading plans',description:'Study guides, lessons, and reading-plan activity.'},
 PRAYER:{title:'Prayer',description:'Prayer requests and prayer-related updates.'},
 GIVING:{title:'Giving and payments',description:'Giving records and payment-related updates.'},
 ACCOUNT:{title:'Account and security',description:'Account access and security-related messages.'},
 OTHER:{title:'Other church activity',description:'Other supported notification types.'},
}
export function NotificationPreferencesPage(){
 const {data,isLoading,error}=useGetNotificationPreferencesQuery()
 const [save,state]=useUpdateNotificationPreferencesMutation()
 const [preferences,setPreferences]=useState<NotificationPreference[]>([])
 const [message,setMessage]=useState('')
 useEffect(()=>{if(data?.data)setPreferences(data.data)},[data])
 function change(category:NotificationPreference['category'],key:'inAppEnabled'|'emailEnabled',value:boolean){setPreferences(current=>current.map(p=>p.category===category?{...p,[key]:value}:p))}
 async function submit(e:React.FormEvent){e.preventDefault();setMessage('');try{const r=await save(preferences).unwrap();setPreferences(r.data);setMessage('Your notification preferences have been saved.')}catch{setMessage('Could not save your preferences. Please try again.')}}
 return <main className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
  <header><p className="text-sm font-bold uppercase tracking-widest text-purple-700">Your account</p><h1 className="mt-1 text-3xl font-black">Notification preferences</h1><p className="mt-2 text-slate-600">Choose which supported church updates appear in your notification centre and which can be sent to your email.</p></header>
  {message&&<p role="status" className="rounded-xl bg-purple-50 p-3 text-purple-900">{message}</p>}
  {isLoading&&<p>Loading preferences…</p>}{error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">Preferences could not be loaded.</p>}
  {!isLoading&&!error&&<form onSubmit={submit} className="space-y-4">
   <div className="grid grid-cols-[minmax(0,1fr)_100px_100px] items-center gap-3 rounded-xl bg-slate-100 p-3 text-sm font-bold"><span>Notification category</span><span className="flex items-center gap-1"><Bell size={15}/> In-app</span><span className="flex items-center gap-1"><Mail size={15}/> Email</span></div>
   {preferences.map(p=><section key={p.category} className="grid grid-cols-[minmax(0,1fr)_100px_100px] items-center gap-3 rounded-xl border bg-white p-4"><div><h2 className="font-bold">{labels[p.category].title}</h2><p className="mt-1 text-sm text-slate-500">{labels[p.category].description}</p></div><label className="flex justify-center"><input aria-label={`${labels[p.category].title} in-app`} type="checkbox" checked={p.inAppEnabled} onChange={e=>change(p.category,'inAppEnabled',e.target.checked)} className="size-5 accent-purple-700"/></label><label className="flex justify-center"><input aria-label={`${labels[p.category].title} email`} type="checkbox" checked={p.emailEnabled} onChange={e=>change(p.category,'emailEnabled',e.target.checked)} className="size-5 accent-purple-700"/></label></section>)}
   <button disabled={state.isLoading} className="inline-flex items-center gap-2 rounded-xl bg-purple-800 px-5 py-3 font-bold text-white disabled:opacity-50"><Save size={17}/>{state.isLoading?'Saving…':'Save preferences'}</button>
  </form>}
 </main>
}
