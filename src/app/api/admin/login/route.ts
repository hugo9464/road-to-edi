import { NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'
import { getAdminToken, isAdminAuthenticated } from '@/lib/admin/auth'

// Check if already authenticated
export async function GET() {
  if (await isAdminAuthenticated()) {
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ ok: false }, { status: 401 })
}

export async function POST(request: Request) {
  const { password } = await request.json()

  const expected = process.env.ADMIN_PASSWORD || ''
  const passwordBuffer = Buffer.from(password || '')
  const expectedBuffer = Buffer.from(expected)

  if (
    passwordBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(passwordBuffer, expectedBuffer)
  ) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const token = getAdminToken()

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}
