import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params
  const body = await request.json()
  const { fingerprint } = body

  if (!fingerprint || typeof fingerprint !== 'string') {
    return NextResponse.json({ error: 'fingerprint is required' }, { status: 400 })
  }

  const supabase = createClient()

  // Upsert — UNIQUE(post_id, fingerprint) prevents duplicates
  await supabase
    .from('bananas')
    .upsert(
      { post_id: postId, fingerprint },
      { onConflict: 'post_id,fingerprint' },
    )

  // Return updated count
  const { count } = await supabase
    .from('bananas')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId)

  return NextResponse.json({ count: count ?? 0 })
}
