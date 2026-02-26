import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://road-to-edi.vercel.app'

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/subscribe/unsubscribed?status=invalid`)
  }

  const supabase = createAdminClient()

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id')
    .eq('unsubscribe_token', token)
    .single()

  if (!subscriber) {
    return NextResponse.redirect(`${siteUrl}/subscribe/unsubscribed?status=not_found`)
  }

  await supabase
    .from('subscribers')
    .delete()
    .eq('id', subscriber.id)

  return NextResponse.redirect(`${siteUrl}/subscribe/unsubscribed?status=success`)
}
