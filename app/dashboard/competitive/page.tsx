'use client'
import { useState, useEffect } from 'react'
import RankLineChart from '@/components/charts/RankLineChart'
import { Loader2, TrendingDown, TrendingUp } from 'lucide-react'

const GENDERS = ['Мужской', 'Женский']
const PROPS = ['Квартира', 'Дом', 'Таунхаус']

interface MarketRow { site: string; my_price: number; my_rank: number; price_min: number; price_avg: number; price_max: number; company_count: number }
interface RankPoint { day: string; site: string; rank: number; price: number }

export default function CompetitivePage() {
  const [meta, setMeta] = useState<{ banks: string[]; companies: string[]; sites: string[] }>({ banks: [], companies: [], sites: [] })
  const [form, setForm] = useState({ company: '', bank: '', gender: 'Мужской', age: 35, property_type: 'Квартира', site: '', days: 30 })
  const [market, setMarket] = useState<MarketRow[]>([])
  const [ranks, setRanks] = useState<RankPoint[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/competitive?type=meta').then(r => r.json()).then(d => {
      setMeta(d)
      if (d.companies?.length) setForm(f => ({ ...f, company: d.companies[0] }))
      if (d.banks?.length) setForm(f => ({ ...f, bank: d.banks[0] }))
      if (d.sites?.length) setForm(f => ({ ...f, site: d.sites[0] }))
    })
  }, [])

  const load = async () => {
    if (!form.company || !form.bank) return
    setLoading(true)
    const base = `company=${encodeURIComponent(form.company)}&bank=${encodeURIComponent(form.bank)}&gender=${form.gender}&age=${form.age}&property_type=${form.property_type}&site=${encodeURIComponent(form.site)}`
    const [mkt, rk] = await Promise.all([
      fetch(`/api/dashboard/competitive?${base}`).then(r => r.json()),
      fetch(`/api/dashboard/competitive?type=rank&${base}&days=${form.days}`).then(r => r.json()),
    ])
    setMarket(mkt.data || [])
    setRanks(rk.data || [])
    setLoading(false)
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setForm({...form, [k]: k === 'age' || k === 'days' ? +e.target.value : e.target.value})

  const fmtPrice = (p: number | null) => p ? p.toLocaleString('ru-RU') + ' ₽' : '—'
  const avgRank = market.length && market.some(r => r.my_rank) ? (market.reduce((s, r) => s + (r.my_rank || 0), 0) / market.filter(r => r.my_rank).length).toFixed(1) : null

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Конкурентный анализ</h1>

      {/* Filters */}
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
            <label className="label">История, дней</label>
            <select className="input" value={form.days} onChange={f('days')}>
              {[7,14,30,60,90].map(d => <option key={d} value={d}>{d} дн.</option>)}
            </select>
          </div>
        </div>
        <button onClick={load} disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Обновить'}
        </button>
      </div>

      {/* Summary metrics */}
      {market.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Средняя позиция', value: avgRank ? `#${avgRank}` : '—' },
              { label: 'Моя цена (ср.)', value: fmtPrice(market.filter(r => r.my_price).reduce((s, r) => s + r.my_price, 0) / (market.filter(r => r.my_price).length || 1)) },
              { label: 'Мин. рынка', value: fmtPrice(Math.min(...market.map(r => r.price_min).filter(Boolean))) },
              { label: 'Сайтов', value: String(market.length) },
            ].map(m => (
              <div key={m.label} className="card">
                <div className="text-2xl font-bold text-slate-900">{m.value}</div>
                <div className="text-sm text-slate-500 mt-1">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Market table */}
          <div className="card mb-6 overflow-x-auto">
            <h2 className="font-semibold text-slate-900 mb-4">Моя цена vs рынок по сайтам</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  {['Сайт', 'Моя цена', 'Позиция', 'Мин. рынка', 'Ср. рынка', 'Макс.', 'Компаний'].map(h => (
                    <th key={h} className="pb-2 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {market.map(r => {
                  const vs = r.my_price && r.price_min ? ((r.my_price / r.price_min - 1) * 100) : null
                  return (
                    <tr key={r.site} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-4 font-medium text-slate-800">{r.site}</td>
                      <td className="py-2.5 pr-4">
                        {r.my_price ? (
                          <span className="font-semibold text-slate-900">{fmtPrice(r.my_price)}</span>
                        ) : <span className="text-slate-400">—</span>}
                        {vs !== null && (
                          <span className={`ml-2 text-xs ${vs > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {vs > 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                            {vs > 0 ? '+' : ''}{vs.toFixed(1)}%
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        {r.my_rank ? (
                          <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold
                            ${r.my_rank === 1 ? 'bg-emerald-100 text-emerald-700' : r.my_rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {r.my_rank}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-emerald-700 font-medium">{fmtPrice(r.price_min)}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{fmtPrice(r.price_avg)}</td>
                      <td className="py-2.5 pr-4 text-red-500">{fmtPrice(r.price_max)}</td>
                      <td className="py-2.5 text-slate-600">{r.company_count}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Rank history */}
          {ranks.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-slate-900 mb-4">Динамика позиции</h2>
              <RankLineChart data={ranks} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
