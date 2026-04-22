import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getPriceTrend, getMarketEntrantsExits, getAllBanks, getAllCompanies, getAllSites } from '@/lib/queries'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'free')
    return NextResponse.json({ error: 'Требуется подписка' }, { status: 403 })

  const p = req.nextUrl.searchParams
  const type = p.get('type') || 'trend'

  if (type === 'events') {
    const days = parseInt(p.get('days') || '30')
    const data = await getMarketEntrantsExits(days)
    return NextResponse.json({ data })
  }

  if (type === 'meta') {
    const [banks, companies, sites] = await Promise.all([getAllBanks(), getAllCompanies(), getAllSites()])
    return NextResponse.json({
      banks: banks.map(b => b.bank),
      companies: companies.map(c => c.insurance_co),
      sites: sites.map(s => s.site),
    })
  }

  const company = p.get('company') || ''
  const bank = p.get('bank') || ''
  const gender = p.get('gender') || 'Мужской'
  const age = parseInt(p.get('age') || '35')
  const propType = p.get('property_type') || 'Квартира'
  const site = p.get('site') || ''
  const days = parseInt(p.get('days') || '60')

  const data = await getPriceTrend(company, bank, gender, age, propType, site, days)
  return NextResponse.json({ data })
}
