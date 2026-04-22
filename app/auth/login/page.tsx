'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Ошибка входа'); return }
    router.push(next)
    router.refresh()
  }

  return (
    <div className="card shadow-lg">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" placeholder="you@company.ru"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div>
          <label className="label">Пароль</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} className="input pr-11"
              placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}
        <button type="submit" disabled={loading}
          className="btn-primary w-full justify-center py-3 disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Войти'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        Нет аккаунта?{' '}
        <Link href="/auth/register" className="text-brand-600 font-medium hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-700 font-bold text-xl mb-6">
            <Shield className="w-7 h-7 text-brand-600" />
            InsureCheck
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Добро пожаловать</h1>
          <p className="text-slate-500 mt-1">Войдите в свой аккаунт</p>
        </div>
        <Suspense fallback={<div className="card shadow-lg h-64 animate-pulse bg-slate-50" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
