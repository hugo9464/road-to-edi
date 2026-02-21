import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const store = await cookies()
  store.delete('admin_token')
  return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}
