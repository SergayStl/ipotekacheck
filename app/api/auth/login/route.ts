import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password)
    return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })

  const rows = await query<{ id: number; email: string; name: string; role: string; company: string; password_hash: string }>(
    'SELECT id, email, name, role, company, password_hash FROM users WHERE email = $1', [email]
  )
  const user = rows[0]
  if (!user || !await bcrypt.compare(password, user.password_hash))
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })

  const token = await signToken({ userId: user.id, email: user.email, name: user.name, role: user.role, company: user.company })
  const res = NextResponse.json({ ok: true, name: user.name, role: user.role })
  res.cookies.set('auth_token', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })
  return res
}
