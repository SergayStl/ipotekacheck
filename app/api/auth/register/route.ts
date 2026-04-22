import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { name, email, password, company } = await req.json()
  if (!name || !email || !password)
    return NextResponse.json({ error: 'Имя, email и пароль обязательны' }, { status: 400 })
  if (password.length < 8)
    return NextResponse.json({ error: 'Пароль минимум 8 символов' }, { status: 400 })

  const existing = await query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.length > 0)
    return NextResponse.json({ error: 'Этот email уже зарегистрирован' }, { status: 409 })

  const hash = await bcrypt.hash(password, 12)
  const rows = await query<{ id: number }>(
    'INSERT INTO users (name, email, password_hash, company) VALUES ($1,$2,$3,$4) RETURNING id',
    [name, email, hash, company || null]
  )
  const userId = rows[0].id
  const token = await signToken({ userId, email, name, role: 'free', company })
  const res = NextResponse.json({ ok: true })
  res.cookies.set('auth_token', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })
  return res
}
