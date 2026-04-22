import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Shield className="w-5 h-5 text-brand-400" />
              InsureCheck
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Ежедневный мониторинг цен на ипотечное страхование. Данные с четырёх крупнейших
              агрегаторов обновляются каждое утро.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Сервисы</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/calculator" className="hover:text-white transition-colors">Калькулятор</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Аналитика</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Тарифы</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Компания</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Регистрация</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Вход</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} InsureCheck. Данные носят информационный характер.</p>
          <p className="text-xs text-slate-500">Обновление ежедневно в 08:00 МСК</p>
        </div>
      </div>
    </footer>
  )
}
