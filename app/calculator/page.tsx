'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PriceBarChart from '@/components/charts/PriceBarChart'
import { Search, TrendingDown, ExternalLink, Loader2, Info } from 'lucide-react'

const GENDERS = ['Мужской', 'Женский']
const PROP_TYPES = ['Квартира', 'Дом', 'Таунхаус']
const AGES = Array.from({length: 48}, (_, i) => i + 18)

interface Offer { site: string; insurance_co: string; price: number; rank: number }

export default function CalculatorPage() {
  const [banks, setBanks] = useState<string[]>([])
  const [dates, setDates] = useState<string[]>([])
  const [form, setForm] = useState({ bank: '', age: 35, gender: 'Мужской', property_type: 'Квартира', date: '' })
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    fetch('/api/calculator').then(r => r.json()).then(d => {
      setBanks(d.banks || [])
      setDates(d.dates || [])
      if (d.banks?.length) setForm(f => ({ ...f, bank: d.banks[0] }))
      if (d.dates?.length) setForm(f => ({ ...f, date: d.dates[0] }))
    })
  }, [])

  const search = async () => {
    if (!form.bank) return
    setLoading(true)
    const params = new URLSearchParams({
      bank: form.bank, age: String(form.age),
      gender: form.gender, property_type: form.property_type,
      ...(form.date ? { date: form.date } : {}),
    })
    const data = await fetch(`/api/calculator?${params}`).then(r => r.json())
    setOffers(data.offers || [])
    setLoading(false)
    setSearched(true)
  }

  const best = offers.length ? offers.reduce((a, b) => a.price < b.price ? a : b) : null
  const bySite: Record<string, Offer[]> = {}
  offers.forEach(o => { bySite[o.site] ??= []; bySite[o.site].push(o) })

  const fmtPrice = (p: number) => p.toLocaleString('ru-RU') + ' ₽'

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Калькулятор страхования</h1>
          <p className="text-slate-500">Введите параметры и получите актуальные цены со всех агрегаторов</p>
        </div>

        {/* Filter card */}
        <div className="card shadow-sm mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="label">Банк-кредитор</label>
              <select className="input" value={form.bank} onChange={e => setForm({...form, bank: e.target.value})}>
                {banks.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Возраст заёмщика</label>
              <select className="input" value={form.age} onChange={e => setForm({...form, age: +e.target.value})}>
                {AGES.map(a => <option key={a} value={a}>{a} лет</option>)}
              </select>
            </div>
            <div>
              <label className="label">Пол</label>
              <select className="input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Тип недвижимости</label>
              <select className="input" value={form.property_type} onChange={e => setForm({...form, property_type: e.target.value})}>
                {PROP_TYPES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Дата данных</label>
              <select className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})}>
                {dates.map(d => <option key={d} value={d}>{new Date(d).toLocaleDateString('ru-RU')}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={search} disabled={loading || !form.bank}
                className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" />Найти</>}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl p-3">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Данные собираются ежедневно с banki.ru, sravni.ru, finuslugi.ru и polis.online.
            Цены приведены за страхование жизни при кредите 3 000 000 ₽.
          </div>
        </div>

        {/* Results */}
        {searched && !loading && (
          <>
            {offers.length === 0 ? (
              <div className="card text-center py-12 text-slate-400">
                Нет данных для выбранных параметров. Попробуйте другую дату или банк.
              </div>
            ) : (
              <>
                {/* Best offer banner */}
                {best && (
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 mb-6 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-emerald-100 mb-1">
                        <TrendingDown className="w-4 h-4 inline mr-1" />Лучшее предложение
                      </div>
                      <div className="text-3xl font-bold">{fmtPrice(best.price)}</div>
                      <div className="text-emerald-100 mt-1">{best.insurance_co} · {best.site}</div>
                    </div>
                    <a href={`https://${best.site}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      Перейти <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Bar chart */}
                <div className="card mb-6">
                  <h2 className="font-semibold text-slate-900 mb-4">Все предложения</h2>
                  <PriceBarChart offers={offers.slice(0, 15)} />
                </div>

                {/* By site */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(bySite).map(([site, siteOffers]) => (
                    <div key={site} className="card">
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
                        {site}
                      </h3>
                      <div className="space-y-2">
                        {siteOffers.slice(0, 5).map((o, i) => (
                          <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-xl
                            ${i === 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50'}`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center
                                ${i === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                {o.rank}
                              </span>
                              <span className="text-sm text-slate-700">{o.insurance_co}</span>
                            </div>
                            <span className={`text-sm font-semibold ${i === 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                              {fmtPrice(o.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {!searched && !loading && (
          <div className="card text-center py-16 text-slate-400 border-dashed">
            <Search className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Выберите параметры и нажмите «Найти»</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
