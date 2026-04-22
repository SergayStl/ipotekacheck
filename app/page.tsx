import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Shield, TrendingUp, BarChart2, Bell, CheckCircle, ArrowRight, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Данные обновляются ежедневно с 4 агрегаторов
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Мониторинг цен на<br />
              <span className="text-yellow-300">ипотечное страхование</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl">
              Сравните предложения всех страховых компаний на banki.ru, sravni.ru, finuslugi.ru
              и polis.online. Бесплатно для заёмщиков — аналитика для страховщиков.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/calculator"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-brand-700 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl">
                Найти лучшую цену
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20">
                Аналитика для компаний
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { value: '4', label: 'агрегатора' },
                { value: '6+', label: 'банков' },
                { value: '30+', label: 'страховых компаний' },
                { value: '10', label: 'возрастных групп' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-blue-200 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── For whom ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Для кого InsureCheck?</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Один инструмент — два сценария использования</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* B2C */}
            <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 p-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="inline-flex badge-free mb-4">Бесплатно</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Заёмщики</h3>
              <p className="text-slate-600 mb-6">
                Вы берёте ипотеку и хотите сэкономить на страховке? Введите параметры — получите
                актуальные цены от всех страховых компаний на всех агрегаторах.
              </p>
              <ul className="space-y-3 mb-8">
                {['Сравнение цен по вашим параметрам', 'Топ-5 дешевейших предложений', 'Данные актуальны на сегодня', 'Без регистрации'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/calculator" className="btn-primary bg-emerald-600 hover:bg-emerald-700 w-full justify-center">
                Открыть калькулятор
              </Link>
            </div>

            {/* B2B */}
            <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/50 p-8">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-5">
                <BarChart2 className="w-6 h-6 text-brand-600" />
              </div>
              <div className="inline-flex badge-basic mb-4">Для бизнеса</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Страховые компании</h3>
              <p className="text-slate-600 mb-6">
                Следите за своей позицией на рынке, отслеживайте изменения конкурентов, анализируйте
                тренды по банкам, возрастам и типам недвижимости.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Ваша цена vs мин/сред/макс рынка',
                  'История позиции за 30–90 дней',
                  'Тепловая карта тарифов по возрастам',
                  'Алерты о значимых изменениях',
                  'Приход и уход конкурентов',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="btn-primary w-full justify-center">
                Смотреть тарифы
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Возможности платформы</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50',
                title: 'Динамика цен',
                desc: 'Линейные графики изменения тарифов по дням. Видите когда конкурент поднял или снизил цену.' },
              { icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50',
                title: 'Тепловая карта',
                desc: 'Матрица "компания × возраст" — одним взглядом видите где вы дешевле или дороже рынка.' },
              { icon: Bell, color: 'text-orange-600', bg: 'bg-orange-50',
                title: 'Алерты об изменениях',
                desc: 'Автоматическое выявление значимых изменений цен за сутки. Порог настраивается.' },
              { icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50',
                title: 'Конкурентный анализ',
                desc: 'Ваша цена vs минимум, среднее и максимум рынка по каждому банку и агрегатору.' },
              { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50',
                title: 'Рейтинг позиций',
                desc: 'История ранга вашей компании в листинге — 1-е место это самый дешёвый тариф.' },
              { icon: ArrowRight, color: 'text-rose-600', bg: 'bg-rose-50',
                title: 'Приход / уход игроков',
                desc: 'Фиксируем какие компании появились или исчезли с агрегаторов за выбранный период.' },
            ].map(f => (
              <div key={f.title} className="card hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Простые и прозрачные тарифы</h2>
          <p className="text-lg text-slate-500 mb-10">Начните бесплатно. Подключите аналитику когда будете готовы.</p>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {[
              { name: 'Бесплатно', price: '0 ₽', period: '', badge: 'badge-free',
                features: ['Калькулятор цен', 'Топ-5 предложений', 'Актуальные данные'],
                cta: 'Начать бесплатно', href: '/calculator', outline: true },
              { name: 'Базовый', price: '3 000 ₽', period: '/мес', badge: 'badge-basic',
                features: ['Всё из Free', 'Конкурентный анализ', 'История 30 дней', 'Тепловая карта'],
                cta: 'Подключить', href: '/pricing', outline: false, highlight: false },
              { name: 'Профессиональный', price: '9 000 ₽', period: '/мес', badge: 'badge-pro',
                features: ['Всё из Basic', 'История 90 дней', 'Алерты об изменениях', 'Приоритетная поддержка'],
                cta: 'Подключить', href: '/pricing', outline: false, highlight: true },
            ].map(p => (
              <div key={p.name}
                className={`rounded-2xl p-6 border-2 flex flex-col ${p.highlight ? 'border-brand-600 shadow-lg shadow-brand-100' : 'border-slate-100'}`}>
                <div className={`inline-flex ${p.badge} mb-3`}>{p.name}</div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {p.price}<span className="text-base font-normal text-slate-500">{p.period}</span>
                </div>
                <ul className="my-5 space-y-2.5 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href}
                  className={p.outline ? 'btn-outline justify-center' : 'btn-primary justify-center'}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-brand-700 to-brand-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Начните прямо сейчас</h2>
          <p className="text-lg text-blue-100 mb-8">
            Калькулятор доступен бесплатно. Для профессиональной аналитики — оставьте заявку.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/calculator"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-brand-700 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg">
              Открыть калькулятор
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
