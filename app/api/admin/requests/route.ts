import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

interface SubscriptionRequest {
  id: number
  user_id: number
  plan: string
  status: string
  comment: string | null
  phone: string | null
  company: string | null
  contact_info: string | null
  telegram_sent: boolean
  telegram_message_id: number | null
  email_reported_at: string | null
  created_at: string
  user_name: string
  user_email: string
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Запрещено' }, { status: 403 })

  const rows = await query<SubscriptionRequest>(`
    SELECT sr.*, u.name as user_name, u.email as user_email
    FROM subscription_requests sr
    JOIN users u ON u.id = sr.user_id
    ORDER BY sr.created_at DESC
  `)

  return NextResponse.json({ requests: rows })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Запрещено' }, { status: 403 })

  const { action, id } = await req.json() as { action: string; id?: number }

  if (action === 'send-email-report') {
    const rows = await query<SubscriptionRequest>(`
      SELECT sr.*, u.name as user_name, u.email as user_email
      FROM subscription_requests sr
      JOIN users u ON u.id = sr.user_id
      WHERE sr.email_reported_at IS NULL
      ORDER BY sr.created_at DESC
    `)

    if (rows.length === 0)
      return NextResponse.json({ message: 'Нет новых заявок для отправки' })

    const lines = rows.map(r => [
      `=== Заявка #${r.id} (${r.plan}) — ${new Date(r.created_at).toLocaleString('ru-RU')} ===`,
      `Имя: ${r.user_name}  |  Email: ${r.user_email}`,
      `Телефон: ${r.phone ?? '—'}  |  Компания: ${r.company ?? '—'}`,
      `Контакт: ${r.contact_info ?? '—'}`,
      r.comment ? `Комментарий: ${r.comment}` : null,
      `Telegram: ${r.telegram_sent ? `отправлено (msg ${r.telegram_message_id})` : 'НЕ отправлено'}`,
      `Статус: ${r.status}`,
    ].filter(Boolean).join('\n'))

    const reportText = [
      `Отчёт по заявкам ipotekacheck.vercel.app`,
      `Дата: ${new Date().toLocaleString('ru-RU')}`,
      `Всего заявок в отчёте: ${rows.length}`,
      '',
      ...lines,
    ].join('\n\n')

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
    if (botToken && chatId) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `📊 <b>Отчёт по заявкам</b>\n\nВсего новых: ${rows.length}\n\n` +
            rows.map(r => `• ${r.user_name} — ${r.plan} (${r.phone ?? r.contact_info})`).join('\n'),
          parse_mode: 'HTML',
        }),
      })
    }

    await query(
      `UPDATE subscription_requests SET email_reported_at=NOW() WHERE id = ANY($1)`,
      [rows.map(r => r.id)]
    )

    return NextResponse.json({ message: `Отчёт подготовлен: ${rows.length} заявок`, report: reportText })
  }

  if (action === 'update-status' && id) {
    const { status } = await req.json() as { status: string }
    await query('UPDATE subscription_requests SET status=$1 WHERE id=$2', [status, id])
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 })
}
