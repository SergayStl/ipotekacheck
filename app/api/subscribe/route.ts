import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })

  const { plan, comment } = await req.json()
  if (!['basic', 'pro'].includes(plan))
    return NextResponse.json({ error: 'Неверный тариф' }, { status: 400 })

  // Check existing pending request
  const existing = await query(
    "SELECT id FROM subscription_requests WHERE user_id=$1 AND status='pending'",
    [session.userId]
  )
  if (existing.length > 0)
    return NextResponse.json({ error: 'Заявка уже подана. Мы свяжемся с вами в течение 24 часов.' }, { status: 409 })

  await query(
    'INSERT INTO subscription_requests (user_id, plan, comment) VALUES ($1,$2,$3)',
    [session.userId, plan, comment || null]
  )
  return NextResponse.json({ ok: true })
}
