import { NextRequest, NextResponse } from 'next/server'
import { getBestOffers, getAllBanks, getAvailableDates } from '@/lib/queries'

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const bank = p.get('bank')
  const age = parseInt(p.get('age') || '35')
  const gender = p.get('gender') || 'Мужской'
  const propertyType = p.get('property_type') || 'Квартира'
  const date = p.get('date') || undefined

  if (!bank) {
    const [banks, dates] = await Promise.all([getAllBanks(), getAvailableDates()])
    return NextResponse.json({ banks: banks.map(b => b.bank), dates: dates.map(d => d.day) })
  }

  try {
    const offers = await getBestOffers(bank, age, gender, propertyType, date)
    return NextResponse.json({ offers })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ offers: [] })
  }
}
