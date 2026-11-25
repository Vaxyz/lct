import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '../../features/auth/authApi'
import { Button } from '../../components/ui/Button'
import { PasswordInput } from '../../components/ui/PasswordInput'

export function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [register, { isLoading, error }] = useRegisterMutation()
  const navigate = useNavigate()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const result = await register(form).unwrap()
      localStorage.setItem('lct_access_token', result.data.accessToken)
      localStorage.setItem('lct_user', JSON.stringify(result.data))
      navigate('/dashboard')
    } catch {
      // The API error is rendered below.
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-81px)] place-items-center px-5 py-16">
      <form onSubmit={submit} className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-purple-900/5">
        <div className="mb-8">
          <p className="text-sm font-bold text-purple-800">JOIN THE COMMUNITY</p>
          <h1 className="mt-2 text-3xl font-black">Create your LifeChanger Touch account</h1>
          <p className="mt-2 text-sm text-slate-500">Your account gives you a secure gateway to the church digital platform.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label><span className="mb-2 block text-sm font-semibold">First name</span><input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100" /></label>
          <label><span className="mb-2 block text-sm font-semibold">Last name</span><input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100" /></label>
        </div>
        <label className="mt-5 block"><span className="mb-2 block text-sm font-semibold">Email</span><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100" /></label>
        <label className="mt-5 block"><span className="mb-2 block text-sm font-semibold">Password</span><PasswordInput required minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /><span className="mt-2 block text-xs text-slate-400">Minimum 8 characters.</span></label>
        {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">Unable to create the account. The email may already be registered or the submitted data is invalid.</p>}
        <Button type="submit" disabled={isLoading} className="mt-6 w-full bg-purple-800 text-white hover:bg-purple-900">{isLoading ? 'Creating account…' : 'Create account'}</Button>
        <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link className="font-bold text-purple-800" to="/login">Sign in</Link></p>
      </form>
    </div>
  )
}
