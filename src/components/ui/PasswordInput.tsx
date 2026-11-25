import { Eye, EyeOff } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { useState } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function PasswordInput({ className = '', ...props }: Props) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={`w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 ${className}`} />
      <button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(v => !v)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 hover:text-purple-700">
        {visible ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </div>
  )
}
