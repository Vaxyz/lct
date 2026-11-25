import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../../features/auth/authApi'
import { Button } from '../../components/ui/Button'
import { PasswordInput } from '../../components/ui/PasswordInput'

export function LoginPage() {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [login,{isLoading,error}]=useLoginMutation(); const navigate=useNavigate()
  const submit=async(e:FormEvent)=>{e.preventDefault(); try { const result=await login({email,password}).unwrap(); localStorage.setItem('lct_access_token',result.data.accessToken); localStorage.setItem('lct_user',JSON.stringify(result.data)); navigate('/dashboard') } catch {} }
  return <div className="grid min-h-[calc(100vh-81px)] place-items-center px-5 py-16"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-purple-900/5"><div className="mb-8"><p className="text-sm font-bold text-purple-800">WELCOME BACK</p><h1 className="mt-2 text-3xl font-black">Sign in to LifeChanger Touch</h1></div><label className="mb-5 block"><span className="mb-2 block text-sm font-semibold">Email</span><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100" /></label><label className="mb-5 block"><span className="mb-2 block text-sm font-semibold">Password</span><PasswordInput value={password} onChange={e=>setPassword(e.target.value)} required /></label>{error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">Unable to sign in. Please check your credentials.</p>}<Button type="submit" disabled={isLoading} className="w-full bg-purple-800 text-white hover:bg-purple-900">{isLoading?'Signing in…':'Sign in'}</Button><p className="mt-6 text-center text-sm text-slate-500">New here? <Link className="font-bold text-purple-800" to="/register">Create an account</Link></p></form></div>
}
