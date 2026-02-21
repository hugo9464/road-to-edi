import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title_fr: body.title_fr,
      title_en: body.title_en,
      slug: body.slug,
      day: body.day,
      location: body.location,
      published_at: body.published_at,
      cover_image_url: body.cover_image_url,
      body_markdown: body.body_markdown,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ post: data })
}
