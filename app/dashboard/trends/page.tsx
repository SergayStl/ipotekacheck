'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'

const GENDERS = ['Мужской', 'Женский']
const PROPS = ['Квартира', 'Дом', 'Таунхаус']

interface TrendPoint { day: string; price: number }
interface Change { site: string; bank: string; insurance_co: string; gender: string; age: number; price_prev: number; price_now: number; pct_change: number }

export default function TrendsPage() {
  const [meta, setMeta] = useState<{ banks: string[]; companies: string[]; sites: string[] }>({ banks: [], companies: [], sites: [] })
  const [form, setForm] = useState({ company: '', bank: '', gender: 'Мужской', age: 35, property_type: 'Квартира', site: '', days: 60 })
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [changes, setChanges] = useState<Change[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/trends?type=meta').then(r => r.json()).then(d => {
      setMeta(d)
      if (d.companies?.length) setForm(f => ({ ...f, company: d.companies[0] }))
      if (d.banks?.length) setForm(f => ({ ...f, bank: d.banks[0] }))
      if (d.sites?.length) setForm(f => ({ ...f, site: d.sites[0] }))
    })
  }, [])

  const load = async () => {
    setLoading(true)
    const p = `company=${encodeURIComponent(form.company)}&bank=${encodeURIComponent(form.bank)}&gender=${form.gender}&age=${form.age}&property_type=${form.property_type}&site=${encodeURIComponent(form.site)}&days=${form.days}`
    const [tr] = await Promise.all([
      fetch(`/api/dashboard/trends?${p}`).then(r => r.json()),
    ])
    setTrend(tr.data || [])
    setLoading(false)
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setForm({...form, [k]: k === 'age' || k === 'days' ? +e.target.value : e.target.value})

  const priceMin = trend.length ? Math.min(...trend.map(d => d.price)) : 0
  const priceMax = trend.length ? Math.max(...trend.map(d => d.price)) : 0
  const priceDelta = trend.length >= 2 ? ((trend[trend.length-1].price - trend[0].price) / trend[0].price * 100) : 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Динамика цен</h1>

      <div className="card mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Компания', key: 'company', opts: meta.companies },
            { label: 'Банк', key: 'bank', opts: meta.banks },
            { label: 'Сайт', key: 'site', opts: meta.sites },
            { label: 'Пол', key: 'gender', opts: GENDERS },
            { label: 'Недвижимость', key: 'property_type', opts: PROPS },
          ].map(({ label, key, opts }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <select className="input" value={(form as Record<string,unknown>)[key] as string} onChange={f(key as keyof typeof form)}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="label">Возраст</label>
            <input type="number" className="input" min={18} max={65} value={form.age} onChange={f('age')} />
          </div>
          <div>
            <label className="label">Период</label>
            <select className="input" value={form.days} onChange={f('days')}>
              {[14,30,60,90,180].map(d => <option key={d} value={d}>{d} дней</option>)}
            </select>
          </div>
        </div>
        <button onClick={load} disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Построить'}
        </button>
      </div>

      {trend.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card">
              <div className="text-xs text-slate-500 mb-1">Мин. за период</div>
              <div className="text-xl font-bold text-emerald-600">{priceMin.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div className="card">
              <div className="text-xs text-slate-500 mb-1">Макс. за период</div>
              <div className="text-xl font-bold text-red-500">{priceMax.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div className="card">
              <div className="text-xs text-slate-500 mb-1">Изменение</div>
              <div className={`text-xl font-bold flex items-center gap-1 ${priceDelta > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                {priceDelta > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {priceDelta > 0 ? '+' : ''}{priceDelta.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-slate-900 mb-4">
              {form.company} · {form.bank} · {form.gender} · {form.age} лет · {form.property_type} · {form.site}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend.map(d => ({ ...d, day: new Date(d.day).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => (v / 1000).toFixed(0) + 'k'} />
                <Tooltip
                  formatter={(v: number) => [v.toLocaleString('ru-RU') + ' ₽', 'Цена']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
