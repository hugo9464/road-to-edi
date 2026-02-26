import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://road-to-edi.vercel.app'

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/subscribe/confirmed?status=invalid`)
  }

  const supabase = createAdminClient()

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id, confirmed_at')
    .eq('confirm_token', token)
    .single()

  if (!subscriber) {
    return NextResponse.redirect(`${siteUrl}/subscribe/confirmed?status=invalid`)
  }

  if (subscriber.confirmed_at) {
    return NextResponse.redirect(`${siteUrl}/subscribe/confirmed?status=already`)
  }

  const { error } = await supabase
    .from('subscribers')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('id', subscriber.id)

  if (error) {
    return NextResponse.redirect(`${siteUrl}/subscribe/confirmed?status=error`)
  }

  return NextResponse.redirect(`${siteUrl}/subscribe/confirmed?status=success`)
}
