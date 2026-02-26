import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params
  const supabase = createAdminClient()

  // Check post exists
  const { data: post } = await supabase.from('posts').select('id').eq('id', postId).single()
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Check existing image count
  const { count } = await supabase
    .from('post_images')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId)
  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: 'Max 5 images per post' }, { status: 400 })
  }

  const formData = await request.formData()
  const files = formData.getAll('files') as File[]
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  const remaining = 5 - (count ?? 0)
  const toUpload = files.slice(0, remaining)
  const uploaded: { url: string; position: number }[] = []

  for (let i = 0; i < toUpload.length; i++) {
    const file = toUpload[i]
    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `${postId}/${Date.now()}-${i}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, { contentType: file.type })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      continue
    }

    const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(filePath)
    uploaded.push({ url: urlData.publicUrl, position: (count ?? 0) + i })
  }

  if (uploaded.length > 0) {
    const { error: insertError } = await supabase.from('post_images').insert(
      uploaded.map((u) => ({ post_id: postId, url: u.url, position: u.position })),
    )
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Set first image as cover if no cover yet
    const { data: postData } = await supabase.from('posts').select('cover_image_url').eq('id', postId).single()
    if (!postData?.cover_image_url) {
      await supabase.from('posts').update({ cover_image_url: uploaded[0].url }).eq('id', postId)
    }
  }

  return NextResponse.json({ uploaded: uploaded.length }, { status: 201 })
}
