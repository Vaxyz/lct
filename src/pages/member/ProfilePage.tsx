import { useEffect, useState, type FormEvent } from 'react'
import { UserRound, Save, Camera, Trash2, X } from 'lucide-react'
import { useMyProfileQuery, useUpdateMyProfileMutation, useUploadMyProfilePhotoMutation, useRemoveMyProfilePhotoMutation } from '../../features/auth/userManagementApi'

export function ProfilePage() {
  const { data, isLoading, isError } = useMyProfileQuery()
  const [updateProfile, updateState] = useUpdateMyProfileMutation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadPhoto, uploadState] = useUploadMyProfilePhotoMutation()
  const [removePhoto, removeState] = useRemoveMyProfilePhotoMutation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  useEffect(() => { if (data?.data) { setFirstName(data.data.firstName); setLastName(data.data.lastName); setEmail(data.data.email) } }, [data])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])
  const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api').replace(/\/$/, '')
  const photoSrc = previewUrl ?? (data?.data.profilePhotoUrl ? `${apiBase}${data.data.profilePhotoUrl}` : null)
  function choosePhoto(file?: File) {
    setErrorMessage(''); setMessage('')
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) { setErrorMessage('Choose a JPG or PNG image.'); return }
    if (file.size > 2 * 1024 * 1024) { setErrorMessage('Profile photo must not exceed 2 MB.'); return }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file))
  }
  async function savePhoto() {
    if (!selectedFile) return
    setErrorMessage(''); setMessage('')
    const body = new FormData(); body.append('file', selectedFile)
    try { await uploadPhoto(body).unwrap(); setSelectedFile(null); setPreviewUrl(null); setMessage('Profile photo uploaded successfully.') }
    catch (error: any) { setErrorMessage(error?.data?.message ?? 'Profile photo could not be uploaded. Please try again.') }
  }
  async function deletePhoto() {
    setErrorMessage(''); setMessage('')
    try { await removePhoto().unwrap(); setSelectedFile(null); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); setMessage('Profile photo removed.') }
    catch (error: any) { setErrorMessage(error?.data?.message ?? 'Profile photo could not be removed. Please try again.') }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage(''); setErrorMessage('')
    try {
      const result = (await updateProfile({ firstName, lastName, email }).unwrap()).data
      localStorage.setItem('lct_access_token', result.accessToken)
      const previous = JSON.parse(localStorage.getItem('lct_user') ?? '{}')
      localStorage.setItem('lct_user', JSON.stringify({ ...previous, ...result, lastName }))
      setMessage('Your profile has been updated successfully.')
    } catch (error: any) {
      setErrorMessage(error?.data?.message ?? 'Your profile could not be updated. Please check the details and try again.')
    }
  }

  return <main className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
    <header><p className="text-sm font-bold uppercase tracking-widest text-purple-700">Your account</p><h1 className="mt-1 flex items-center gap-3 text-3xl font-black"><UserRound/> My profile</h1><p className="mt-2 text-slate-600">Keep your name and email address up to date. Your assigned roles and permissions can only be changed by an authorized administrator.</p></header>
    {isLoading && <p>Loading your profile…</p>}
    {isError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">Your profile could not be loaded. Please sign in again if your session has expired.</p>}
    {message && <p role="status" className="rounded-xl bg-green-50 p-4 text-green-800">{message}</p>}
    {errorMessage && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{errorMessage}</p>}
    {!isLoading && !isError && <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <section className="rounded-2xl border border-purple-100 bg-purple-50/50 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white bg-white text-purple-800 shadow-sm">{photoSrc ? <img src={photoSrc} alt="Profile preview" className="size-full object-cover"/> : <UserRound size={42}/>}</div><div className="min-w-0 flex-1"><h2 className="font-black">Profile photo <span className="text-sm font-medium text-slate-500">(optional)</span></h2><p className="mt-1 text-sm text-slate-600">JPG or PNG · maximum 2 MB. Selecting a photo previews it immediately; it is not uploaded until you save it.</p><div className="mt-3 flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-bold text-purple-800 hover:bg-purple-50"><Camera size={16}/>{selectedFile ? 'Choose another' : 'Choose photo'}<input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={e=>choosePhoto(e.target.files?.[0])}/></label>{selectedFile && <><button type="button" onClick={savePhoto} disabled={uploadState.isLoading} className="rounded-xl bg-purple-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{uploadState.isLoading ? 'Uploading…' : 'Save photo'}</button><button type="button" onClick={()=>{setSelectedFile(null); if(previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null)}} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold"><X size={15}/> Cancel</button></>}{!selectedFile && data?.data.profilePhotoUrl && <button type="button" onClick={deletePhoto} disabled={removeState.isLoading} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={15}/>{removeState.isLoading ? 'Removing…' : 'Remove photo'}</button>}</div></div></div></section>
      <label className="block"><span className="mb-2 block text-sm font-bold">First name</span><input required maxLength={100} value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"/></label>
      <label className="block"><span className="mb-2 block text-sm font-bold">Last name</span><input required maxLength={100} value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"/></label>
      <label className="block"><span className="mb-2 block text-sm font-bold">Email address</span><input required type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"/><span className="mt-1 block text-xs text-slate-500">Changing your email updates your sign-in address.</span></label>
      <button disabled={updateState.isLoading} className="inline-flex items-center gap-2 rounded-xl bg-purple-800 px-5 py-3 font-bold text-white hover:bg-purple-900 disabled:opacity-50"><Save size={17}/>{updateState.isLoading ? 'Saving…' : 'Save profile'}</button>
    </form>}
  </main>
}
