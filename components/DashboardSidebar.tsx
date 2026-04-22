'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, TrendingUp, Globe, Home } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Обзор', icon: Home },
  { href: '/dashboard/competitive', label: 'Конкурентный анализ', icon: BarChart2 },
  { href: '/dashboard/trends', label: 'Динамика цен', icon: TrendingUp },
  { href: '/dashboard/market', label: 'Рынок сегодня', icon: Globe },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden lg:block w-56 flex-shrink-0">
      <nav className="sticky top-24 space-y-1">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${pathname === l.href
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <l.icon className="w-4 h-4" />
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
