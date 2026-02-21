import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()
  await supabase.from('posts').delete().eq('id', id)

  redirect('/admin/posts')
}
