import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

async function sendTelegram(text: string): Promise<{ sent: boolean; messageId: number | null }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) return { sent: false, messageId: null }

  try {
    const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    const data = await resp.json() as { ok: boolean; result?: { message_id: number } }
    if (data.ok) return { sent: true, messageId: data.result?.message_id ?? null }
  } catch {}
  return { sent: false, messageId: null }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })

  const body = await req.json() as { plan?: string; comment?: string; phone?: string; company?: string; contact?: string }
  const { plan, comment, phone, company, contact } = body

  if (!['basic', 'pro'].includes(plan ?? ''))
    return NextResponse.json({ error: 'Неверный тариф' }, { status: 400 })
  if (!phone || !company || !contact)
    return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 })

  const existing = await query<{ id: number }>(
    "SELECT id FROM subscription_requests WHERE user_id=$1 AND status='pending'",
    [session.userId]
  )
  if (existing.length > 0)
    return NextResponse.json({ error: 'Заявка уже подана. Мы свяжемся с вами в течение 24 часов.' }, { status: 409 })

  const planLabel = plan === 'pro' ? 'Профессиональный' : 'Базовый'
  const inserted = await query<{ id: number }>(
    `INSERT INTO subscription_requests (user_id, plan, comment, phone, company, contact_info)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [session.userId, plan, comment || null, phone, company, contact]
  )
  const reqId = (inserted[0] as { id: number }).id

  const tgText = [
    `🆕 <b>Новая заявка на тариф «${planLabel}»</b>`,
    '',
    `👤 <b>Имя:</b> ${session.name}`,
    `📞 <b>Телефон:</b> ${phone}`,
    `🏢 <b>Компания:</b> ${company}`,
    `📧 <b>Контакт:</b> ${contact}`,
    comment ? `💬 <b>Комментарий:</b> ${comment}` : null,
    '',
    `#заявка #${plan} #id${reqId}`,
  ].filter(Boolean).join('\n')

  const { sent, messageId } = await sendTelegram(tgText)

  await query(
    'UPDATE subscription_requests SET telegram_sent=$1, telegram_message_id=$2 WHERE id=$3',
    [sent, messageId, reqId]
  )

  return NextResponse.json({ ok: true, telegramSent: sent })
}
