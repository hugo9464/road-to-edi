import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend } from '@/lib/resend/client'
import ConfirmSubscription from '@/lib/resend/emails/ConfirmSubscription'

export async function POST(request: Request) {
  const body = await request.json()
  const email = body.email?.trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Check if already subscribed and confirmed
  const { data: existing } = await supabase
    .from('subscribers')
    .select('id, confirmed_at, confirm_token')
    .eq('email', email)
    .single()

  if (existing?.confirmed_at) {
    return NextResponse.json({ message: 'Déjà inscrit !' })
  }

  let confirmToken: string

  if (existing) {
    // Resend confirmation email with existing token
    confirmToken = existing.confirm_token
  } else {
    // Insert new subscriber
    const { data, error } = await supabase
      .from('subscribers')
      .insert({ email })
      .select('confirm_token')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
    confirmToken = data.confirm_token
  }

  // Send confirmation email
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://road-to-edi.vercel.app'
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Road to Edi <noreply@road-to-edi.vercel.app>'
  const confirmUrl = `${siteUrl}/api/subscribe/confirm?token=${confirmToken}`

  const resend = getResend()
  const { error: emailError } = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Confirme ton inscription — Road to Edi',
    react: ConfirmSubscription({ confirmUrl }),
  })

  if (emailError) {
    console.error('Resend error:', emailError)
    return NextResponse.json({ error: "Erreur d'envoi" }, { status: 500 })
  }

  return NextResponse.json({ message: 'Email de confirmation envoyé !' })
}
