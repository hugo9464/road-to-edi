import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params
  const supabase = createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params
  const body = await request.json()
  const { author, body: commentBody } = body

  if (!author || typeof author !== 'string' || author.length < 1 || author.length > 50) {
    return NextResponse.json({ error: 'author must be 1-50 chars' }, { status: 400 })
  }
  if (!commentBody || typeof commentBody !== 'string' || commentBody.length < 1 || commentBody.length > 500) {
    return NextResponse.json({ error: 'body must be 1-500 chars' }, { status: 400 })
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author, body: commentBody })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
