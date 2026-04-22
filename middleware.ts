import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/dashboard')) return NextResponse.next()

  const token = req.cookies.get('auth_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login?next=' + pathname, req.url))
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string

    // B2B страницы требуют basic или pro
    if (pathname !== '/dashboard' && role === 'free') {
      return NextResponse.redirect(new URL('/pricing?upgrade=1', req.url))
    }
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/auth/login', req.url))
    res.cookies.delete('auth_token')
    return res
  }
}

export const config = { matcher: ['/dashboard/:path*'] }
