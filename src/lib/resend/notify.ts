import { getResend } from './client'
import { createAdminClient } from '@/lib/supabase/admin'
import NewPostNotification from './emails/NewPostNotification'

const BATCH_SIZE = 50

export async function notifySubscribersOfNewPost(post: {
  title_fr: string
  slug: string
  body_markdown: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://road-to-edi.vercel.app'
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Road to Edi <noreply@road-to-edi.vercel.app>'
  const postUrl = `${siteUrl}/#post-${post.slug}`
  const excerpt = post.body_markdown.slice(0, 200).replace(/\n/g, ' ').trim() + (post.body_markdown.length > 200 ? '…' : '')

  const supabase = createAdminClient()
  const { data: subscribers, error } = await supabase
    .from('subscribers')
    .select('email, unsubscribe_token')
    .not('confirmed_at', 'is', null)

  if (error || !subscribers?.length) return

  const resend = getResend()

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE)
    await Promise.allSettled(
      batch.map((sub) =>
        resend.emails.send({
          from: fromEmail,
          to: sub.email,
          subject: `Nouveau post : ${post.title_fr}`,
          react: NewPostNotification({
            postTitle: post.title_fr,
            postUrl,
            excerpt,
            unsubscribeUrl: `${siteUrl}/api/unsubscribe?token=${sub.unsubscribe_token}`,
          }),
        }),
      ),
    )
  }
}
