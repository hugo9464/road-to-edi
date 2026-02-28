import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCustomRoute } from '@/lib/supabase/route-storage'
import type { SiteSettings } from '@/lib/supabase/types'
import SettingsForm from '@/components/admin/SettingsForm'
import GpxUpload from '@/components/admin/GpxUpload'
import FerryParams from '@/components/admin/FerryParams'

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
  const customProps = customRoute?.features?.[0]?.properties ?? null
  const currentRouteInfo = customProps
    ? {
        name: String(customProps.name ?? 'Trace personnalisée'),
        totalKm: Number(customProps.totalKm ?? 0),
      }
    : null
  const ferryInfo = customProps
    ? {
        boatStartKm: Number(customProps.boatStartKm ?? 150),
        boatKm: Number(customProps.boatKm ?? 155),
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
        {ferryInfo && (
          <div className="border-t border-gray-700 pt-6">
            <FerryParams boatStartKm={ferryInfo.boatStartKm} boatKm={ferryInfo.boatKm} />
          </div>
        )}
      </div>
    </div>
  )
}
