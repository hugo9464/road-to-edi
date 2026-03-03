import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json()
  const { title_fr, body_markdown, location } = body

  const supabase = createAdminClient()

  const updates: Record<string, unknown> = {}
  if (title_fr !== undefined) updates.title_fr = title_fr
  if (body_markdown !== undefined) updates.body_markdown = body_markdown
  if (location !== undefined) updates.location = location || null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
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

  // Fetch images to delete from storage
  const { data: images } = await supabase
    .from('post_images')
    .select('url')
    .eq('post_id', id)

  // Delete storage files
  if (images && images.length > 0) {
    const paths = images.map((img) => {
      const url = img.url as string
      // Extract path after /post-images/
      const match = url.match(/\/post-images\/(.+)$/)
      return match ? match[1] : null
    }).filter(Boolean) as string[]

    if (paths.length > 0) {
      await supabase.storage.from('post-images').remove(paths)
    }
  }

  // Delete post (cascades to post_images, comments, bananas)
  const { error } = await supabase.from('posts').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
