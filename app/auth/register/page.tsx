'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', company: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({...form, [k]: e.target.value})

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return }
    if (form.password.length < 8) { setError('Пароль минимум 8 символов'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, company: form.company, password: form.password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Ошибка регистрации'); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  if (done) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Аккаунт создан!</h2>
        <p className="text-slate-500">Перенаправляем в дашборд…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-700 font-bold text-xl mb-6">
            <Shield className="w-7 h-7 text-brand-600" />InsureCheck
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Создать аккаунт</h1>
          <p className="text-slate-500 mt-1">Бесплатно. Без привязки карты.</p>
        </div>

        <div className="card shadow-lg">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">Имя *</label>
                <input className="input" placeholder="Иван Петров" value={form.name} onChange={f('name')} required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input" placeholder="ivan@company.ru" value={form.email} onChange={f('email')} required />
              </div>
              <div>
                <label className="label">Компания <span className="text-slate-400 font-normal">(необязательно)</span></label>
                <input className="input" placeholder="Название страховой компании" value={form.company} onChange={f('company')} />
              </div>
              <div>
                <label className="label">Пароль *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="input pr-11"
                    placeholder="Минимум 8 символов" value={form.password} onChange={f('password')} required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Повторите пароль *</label>
                <input type="password" className="input" placeholder="••••••••"
                  value={form.confirm} onChange={f('confirm')} required />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Создать аккаунт'}
            </button>

            <p className="text-xs text-slate-400 text-center">
              Регистрируясь, вы соглашаетесь с условиями использования сервиса.
            </p>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Уже есть аккаунт?{' '}
            <Link href="/auth/login" className="text-brand-600 font-medium hover:underline">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
