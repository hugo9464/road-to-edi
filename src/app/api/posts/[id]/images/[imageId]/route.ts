import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const { id: postId, imageId } = await params
  const supabase = createAdminClient()

  // Fetch image record
  const { data: image, error: fetchError } = await supabase
    .from('post_images')
    .select('url, post_id')
    .eq('id', imageId)
    .single()

  if (fetchError || !image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  if (image.post_id !== postId) {
    return NextResponse.json({ error: 'Image does not belong to this post' }, { status: 403 })
  }

  // Delete from storage
  const match = (image.url as string).match(/\/post-images\/(.+)$/)
  if (match) {
    await supabase.storage.from('post-images').remove([match[1]])
  }

  // Delete image record
  const { error } = await supabase.from('post_images').delete().eq('id', imageId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update cover_image_url if this was the cover
  const { data: post } = await supabase
    .from('posts')
    .select('cover_image_url')
    .eq('id', postId)
    .single()

  if (post?.cover_image_url === image.url) {
    const { data: remaining } = await supabase
      .from('post_images')
      .select('url')
      .eq('post_id', postId)
      .order('position', { ascending: true })
      .limit(1)

    await supabase
      .from('posts')
      .update({ cover_image_url: remaining?.[0]?.url ?? null })
      .eq('id', postId)
  }

  return NextResponse.json({ success: true })
}
