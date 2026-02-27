import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCustomRoute } from '@/lib/supabase/route-storage'
import type { SiteSettings } from '@/lib/supabase/types'
import SettingsForm from '@/components/admin/SettingsForm'
import GpxUpload from '@/components/admin/GpxUpload'

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

  // Check Storage for a custom route file
  const customRoute = await getCustomRoute()
  const currentRouteInfo = customRoute?.features?.[0]?.properties
    ? {
        name: String(customRoute.features[0].properties.name ?? 'Trace personnalisée'),
        totalKm: Number(customRoute.features[0].properties.totalKm ?? 0),
      }
    : null

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Parametres</h2>
      <div className="space-y-8">
        <SettingsForm settings={defaults} />
        <div className="border-t border-gray-700 pt-6">
          <GpxUpload currentRoute={currentRouteInfo} />
        </div>
      </div>
    </div>
  )
}
