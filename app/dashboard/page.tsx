import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BarChart2, TrendingUp, Globe, ArrowRight, Crown } from 'lucide-react'

export default async function DashboardOverview() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const isPaid = session.role !== 'free'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Добро пожаловать, {session.name} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {session.company && `${session.company} · `}
          <span className={`badge-${session.role}`}>{session.role}</span>
        </p>
      </div>

      {!isPaid && (
        <div className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 text-white p-6 mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold">Разблокируйте профессиональную аналитику</span>
            </div>
            <p className="text-blue-100 text-sm">
              Конкурентный анализ, история рангов, тепловые карты — от 3 000 ₽/мес
            </p>
          </div>
          <Link href="/pricing" className="flex-shrink-0 bg-white text-brand-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors whitespace-nowrap">
            Подключить
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/competitive', icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50',
            title: 'Конкурентный анализ', desc: 'Ваша цена vs мин/сред/макс рынка и история позиций', paid: true },
          { href: '/dashboard/trends', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50',
            title: 'Динамика цен', desc: 'График изменения тарифов и значимые события рынка', paid: true },
          { href: '/dashboard/market', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50',
            title: 'Рынок сегодня', desc: 'Тепловая карта тарифов и приход/уход компаний', paid: true },
        ].map(card => (
          <Link key={card.href} href={card.paid && !isPaid ? '/pricing?upgrade=1' : card.href}
            className="card hover:shadow-md transition-all group relative">
            {card.paid && !isPaid && (
              <div className="absolute top-3 right-3">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{card.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{card.desc}</p>
            <div className="flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
              {card.paid && !isPaid ? 'Требует подписки' : 'Открыть'}
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
