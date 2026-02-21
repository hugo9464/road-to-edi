import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin/auth'

export default async function AdminPage() {
  const authed = await isAdminAuthenticated()
  if (!authed) redirect('/admin/login')
  redirect('/admin/posts')
}
