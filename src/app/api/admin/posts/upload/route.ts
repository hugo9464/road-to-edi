import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const supabase = createAdminClient()

  const { error } = await supabase.storage
    .from('post-images')
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const { data: urlData } = supabase.storage
    .from('post-images')
    .getPublicUrl(filename)

  return NextResponse.json({ url: urlData.publicUrl })
}
