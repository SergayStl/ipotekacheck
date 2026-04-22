'use client'
import { useState, useEffect } from 'react'
import HeatmapChart from '@/components/charts/HeatmapChart'
import { Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

const GENDERS = ['Мужской', 'Женский']
const PROPS = ['Квартира', 'Дом', 'Таунхаус']

export default function MarketPage() {
  const [meta, setMeta] = useState<{ banks: string[]; sites: string[]; dates: string[] }>({ banks: [], sites: [], dates: [] })
  const [form, setForm] = useState({ bank: '', gender: 'Мужской', property_type: 'Квартира', site: '', date: '', evDays: 30 })
  const [heatmap, setHeatmap] = useState<{ insurance_co: string; age: number; price: number }[]>([])
  const [events, setEvents] = useState<{ insurance_co: string; site: string; bank: string; first_seen: string; last_seen: string; event: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/market?type=meta').then(r => r.json()).then(d => {
      setMeta(d)
      if (d.banks?.length) setForm(f => ({ ...f, bank: d.banks[0] }))
      if (d.sites?.length) setForm(f => ({ ...f, site: d.sites[0] }))
      if (d.dates?.length) setForm(f => ({ ...f, date: d.dates[0] }))
    })
  }, [])

  const load = async () => {
    setLoading(true)
    const hm = await fetch(`/api/dashboard/market?bank=${encodeURIComponent(form.bank)}&gender=${form.gender}&property_type=${form.property_type}&site=${encodeURIComponent(form.site)}&date=${form.date}`).then(r => r.json())
    const ev = await fetch(`/api/dashboard/trends?type=events&days=${form.evDays}`).then(r => r.json())
    setHeatmap(hm.data || [])
    setEvents(ev.data || [])
    setLoading(false)
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setForm({...form, [k]: k === 'evDays' ? +e.target.value : e.target.value})

  const appeared = events.filter(e => e.event === 'appeared')
  const gone = events.filter(e => e.event === 'disappeared')

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Рынок сегодня</h1>

      <div className="card mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          {[
            { label: 'Банк', key: 'bank', opts: meta.banks },
            { label: 'Пол', key: 'gender', opts: GENDERS },
            { label: 'Недвижимость', key: 'property_type', opts: PROPS },
            { label: 'Сайт', key: 'site', opts: meta.sites },
            { label: 'Дата', key: 'date', opts: meta.dates, fmt: (d: string) => new Date(d).toLocaleDateString('ru-RU') },
          ].map(({ label, key, opts, fmt }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <select className="input" value={(form as Record<string,unknown>)[key] as string} onChange={f(key as keyof typeof form)}>
                {opts.map(o => <option key={o} value={o}>{fmt ? fmt(o) : o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button onClick={load} disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Обновить'}
        </button>
      </div>

      {/* Heatmap */}
      <div className="card mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Тепловая карта тарифов (компания × возраст)</h2>
        <HeatmapChart data={heatmap} />
      </div>

      {/* Entrants/exits */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-emerald-500" /> Новые игроки
            </h2>
            <select className="input text-sm py-1.5 w-28" value={form.evDays} onChange={f('evDays')}>
              {[7,14,30,60,90].map(d => <option key={d} value={d}>{d} дн.</option>)}
            </select>
          </div>
          {appeared.length === 0
            ? <p className="text-sm text-slate-400">За выбранный период новых игроков нет</p>
            : <div className="space-y-2">
                {appeared.map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                    <div>
                      <div className="font-medium text-slate-800">{e.insurance_co}</div>
                      <div className="text-slate-400">{e.site} · {e.bank}</div>
                    </div>
                    <div className="text-xs text-emerald-600">{new Date(e.first_seen).toLocaleDateString('ru-RU')}</div>
                  </div>
                ))}
              </div>
          }
        </div>
        <div className="card">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <ArrowDownCircle className="w-5 h-5 text-red-400" /> Ушедшие игроки
          </h2>
          {gone.length === 0
            ? <p className="text-sm text-slate-400">Уходов за выбранный период нет</p>
            : <div className="space-y-2">
                {gone.map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                    <div>
                      <div className="font-medium text-slate-800">{e.insurance_co}</div>
                      <div className="text-slate-400">{e.site} · {e.bank}</div>
                    </div>
                    <div className="text-xs text-red-500">{new Date(e.last_seen).toLocaleDateString('ru-RU')}</div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  )
}
