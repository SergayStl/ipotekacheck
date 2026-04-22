import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getHeatmapData, getAllBanks, getAllSites, getAvailableDates } from '@/lib/queries'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'free')
    return NextResponse.json({ error: 'Требуется подписка' }, { status: 403 })

  const p = req.nextUrl.searchParams
  const type = p.get('type') || 'heatmap'

  if (type === 'meta') {
    const [banks, sites, dates] = await Promise.all([getAllBanks(), getAllSites(), getAvailableDates()])
    return NextResponse.json({
      banks: banks.map(b => b.bank),
      sites: sites.map(s => s.site),
      dates: dates.map(d => d.day),
    })
  }

  const bank = p.get('bank') || ''
  const gender = p.get('gender') || 'Мужской'
  const propType = p.get('property_type') || 'Квартира'
  const site = p.get('site') || ''
  const date = p.get('date') || undefined

  const rows = await getHeatmapData(bank, gender, propType, site, date)
  return NextResponse.json({ data: rows })
}
