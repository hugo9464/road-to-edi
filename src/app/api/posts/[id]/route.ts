import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, post_images(*)')
    .eq('id', id)
    .single()

  if (error || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json(post)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json()
  const { title_fr, body_markdown, location, lat, lng } = body

  if (!title_fr || typeof title_fr !== 'string') {
    return NextResponse.json({ error: 'title_fr is required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('posts')
    .update({
      title_fr,
      body_markdown: body_markdown ?? '',
      location: location ?? null,
      lat: lat ?? null,
      lng: lng ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = createAdminClient()

  // Delete images from storage first
  const { data: images } = await supabase
    .from('post_images')
    .select('url')
    .eq('post_id', id)

  if (images && images.length > 0) {
    const paths = images.map((img: { url: string }) => {
      const url = new URL(img.url)
      // Extract path after /post-images/
      const match = url.pathname.match(/post-images\/(.+)$/)
      return match ? match[1] : null
    }).filter(Boolean) as string[]

    if (paths.length > 0) {
      await supabase.storage.from('post-images').remove(paths)
    }
  }

  // Delete post (cascade will remove post_images, comments, bananas rows)
  const { error } = await supabase.from('posts').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
