import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils/slugify'
import { notifySubscribersOfNewPost } from '@/lib/resend/notify'

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title_fr, body_markdown, lat, lng, location, day } = body

  if (!title_fr || typeof title_fr !== 'string') {
    return NextResponse.json({ error: 'title_fr is required' }, { status: 400 })
  }

  const slug = slugify(title_fr) + '-' + Date.now().toString(36)

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title_fr,
      slug,
      body_markdown: body_markdown ?? '',
      lat: lat ?? null,
      lng: lng ?? null,
      location: location ?? null,
      day: day ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fire-and-forget: notify email subscribers
  notifySubscribersOfNewPost({
    title_fr: data.title_fr,
    slug: data.slug,
    body_markdown: data.body_markdown,
  }).catch((err) => console.error('Email notification error:', err))

  return NextResponse.json(data, { status: 201 })
}
