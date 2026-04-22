import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InsureCheck — мониторинг ипотечного страхования',
  description: 'Сравните цены на страхование ипотеки от всех страховых компаний. Калькулятор для заёмщиков и аналитика для страховых компаний.',
  openGraph: {
    title: 'InsureCheck',
    description: 'Мониторинг цен на ипотечное страхование',
    url: 'https://insurecheck.vercel.app',
    siteName: 'InsureCheck',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  )
}
