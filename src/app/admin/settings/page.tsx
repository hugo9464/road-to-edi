import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SiteSettings } from '@/lib/supabase/types'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function AdminSettingsPage() {
  const authed = await isAdminAuthenticated()
  if (!authed) redirect('/admin/login')

  const supabase = createAdminClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single()

  const defaults: SiteSettings = settings ?? {
    id: 1,
    journey_start_date: null,
    total_distance_km: 0,
    instagram_handle: '',
    donation_url: '',
    fundraising_goal: 0,
    fundraising_current: 0,
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Parametres</h2>
      <SettingsForm settings={defaults} />
    </div>
  )
}
