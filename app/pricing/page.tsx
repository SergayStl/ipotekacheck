'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckCircle, Crown, Zap, Shield, Loader2 } from 'lucide-react'

const PLANS = [
  {
    id: 'free', name: 'Бесплатный', price: '0 ₽', period: '', icon: Shield, color: 'text-emerald-600',
    bg: 'bg-emerald-50', border: 'border-emerald-100',
    features: ['Калькулятор цен', 'Топ-5 предложений по каждому агрегатору', 'Актуальные данные (обновление ежедневно)', 'Без регистрации'],
    cta: 'Начать бесплатно', ctaHref: '/calculator', highlight: false,
    note: '',
  },
  {
    id: 'basic', name: 'Базовый', price: '3 000 ₽', period: '/мес', icon: Zap, color: 'text-brand-600',
    bg: 'bg-brand-50', border: 'border-brand-200',
    features: ['Всё из тарифа «Бесплатный»', 'Конкурентный анализ (ваша цена vs рынок)', 'История позиций за 30 дней', 'Тепловая карта тарифов по возрастам', 'Фиксация прихода/ухода игроков', 'Доступ по 1 компании'],
    cta: 'Оставить заявку', ctaHref: null, highlight: false,
    note: 'Для оформления свяжемся по email в течение 24 ч.',
  },
  {
    id: 'pro', name: 'Профессиональный', price: '9 000 ₽', period: '/мес', icon: Crown, color: 'text-purple-600',
    bg: 'bg-purple-50', border: 'border-purple-200',
    features: ['Всё из тарифа «Базовый»', 'История позиций за 90 дней', 'Алерты о значимых изменениях цен', 'Динамика цен с аннотациями', 'Несколько компаний в аккаунте', 'Экспорт данных', 'Приоритетная поддержка'],
    cta: 'Оставить заявку', ctaHref: null, highlight: true,
    note: 'Для корпоративных клиентов — индивидуальные условия.',
  },
]

export default function PricingPage() {
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [showModal, setShowModal] = useState<string | null>(null)

  const submit = async (plan: string) => {
    setSubmitting(plan); setError('')
    const res = await fetch('/api/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, comment }),
    })
    const data = await res.json()
    setSubmitting(null)
    if (res.status === 401) { window.location.href = '/auth/register'; return }
    if (!res.ok) { setError(data.error); return }
    setSubmitted(plan); setShowModal(null)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Тарифы</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Начните бесплатно. Подключите профессиональную аналитику когда будете готовы.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div key={plan.id}
              className={`rounded-2xl border-2 p-7 flex flex-col ${plan.border} ${plan.highlight ? 'shadow-xl shadow-purple-100 scale-105' : ''} bg-white relative`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Популярный
                </div>
              )}
              <div className={`w-11 h-11 rounded-xl ${plan.bg} flex items-center justify-center mb-4`}>
                <plan.icon className={`w-6 h-6 ${plan.color}`} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
              <div className="text-3xl font-bold text-slate-900 my-3">
                {plan.price}<span className="text-base font-normal text-slate-500">{plan.period}</span>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.note && <p className="text-xs text-slate-400 mb-4">{plan.note}</p>}

              {submitted === plan.id ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm text-center">
                  ✓ Заявка принята! Свяжемся в течение 24 часов.
                </div>
              ) : plan.ctaHref ? (
                <a href={plan.ctaHref} className="btn-primary bg-emerald-600 hover:bg-emerald-700 justify-center">{plan.cta}</a>
              ) : (
                <button onClick={() => setShowModal(plan.id)} disabled={submitting === plan.id}
                  className={`btn-primary justify-center ${plan.highlight ? 'bg-purple-600 hover:bg-purple-700' : ''} disabled:opacity-60`}>
                  {submitting === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm text-center">
            {error}
          </div>
        )}

        <p className="text-center text-sm text-slate-400 mt-10">
          Есть вопросы? Напишите нам — мы ответим в течение одного рабочего дня.
        </p>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Частые вопросы</h2>
          <div className="space-y-4">
            {[
              { q: 'Как часто обновляются данные?', a: 'Данные собираются ежедневно с 4 агрегаторов. Обновление происходит каждое утро около 08:00 МСК.' },
              { q: 'Какие агрегаторы отслеживаются?', a: 'banki.ru, sravni.ru, finuslugi.ru и polis.online — крупнейшие площадки для выбора страхования ипотеки.' },
              { q: 'Как происходит оплата?', a: 'После подачи заявки мы свяжемся по email, согласуем детали и выставим счёт. Оплата картой или по реквизитам.' },
              { q: 'Можно ли отслеживать несколько компаний?', a: 'Тариф «Профессиональный» поддерживает несколько компаний в одном аккаунте. Для тарифа «Базовый» — одна компания.' },
            ].map(({ q, a }) => (
              <div key={q} className="card">
                <h3 className="font-semibold text-slate-900 mb-2">{q}</h3>
                <p className="text-sm text-slate-500">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal for subscription request */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Заявка на тариф «{PLANS.find(p => p.id === showModal)?.name}»
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Оставьте комментарий (необязательно) — например, название компании и задачи которые хотите решить.
            </p>
            <textarea className="input resize-none h-24 mb-4" placeholder="Опишите ваши задачи..."
              value={comment} onChange={e => setComment(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(null)} className="btn-outline flex-1 justify-center">Отмена</button>
              <button onClick={() => submit(showModal)} disabled={!!submitting}
                className="btn-primary flex-1 justify-center disabled:opacity-60">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Отправить заявку'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
