'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Shield, Menu, X, ChevronDown } from 'lucide-react'

interface User { name: string; role: string; email: string }

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setUser(d))
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  const navLinks = [
    { href: '/calculator', label: 'Калькулятор' },
    { href: '/pricing', label: 'Тарифы' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
            <Shield className="w-6 h-6 text-brand-600" />
            InsureCheck
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${pathname === l.href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                {l.label}
              </Link>
            ))}
            {user && (
              <Link href="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${pathname.startsWith('/dashboard')
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                Дашборд
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                  <span className={`badge-${user.role}`}>{user.role}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1">
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setDropOpen(false)}>Дашборд</Link>
                    <Link href="/pricing" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setDropOpen(false)}>Тарифы</Link>
                    <hr className="my-1 border-slate-100" />
                    <button onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-outline text-sm py-2">Войти</Link>
                <Link href="/auth/register" className="btn-primary text-sm py-2">Регистрация</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user
              ? <button onClick={logout} className="block w-full text-left px-4 py-2.5 text-sm text-red-600">Выйти</button>
              : <>
                  <Link href="/auth/login" className="block px-4 py-2.5 text-sm font-medium text-slate-700">Войти</Link>
                  <Link href="/auth/register" className="block px-4 py-2.5 text-sm font-semibold text-brand-700">Регистрация</Link>
                </>
            }
          </div>
        )}
      </div>
    </nav>
  )
}
