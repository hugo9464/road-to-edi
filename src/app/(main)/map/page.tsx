import { createClient } from '@/lib/supabase/server'
import { getCustomRoute } from '@/lib/supabase/route-storage'
import MapWrapper from '@/components/map/MapWrapper'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export default async function MapPage() {
  let latestPosition = null
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('gps_positions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()
    latestPosition = data
  } catch {
    // No position available yet
  }

  const geojsonPath = path.join(process.cwd(), 'public', 'data', 'route.geojson')
  const geojsonRaw = await fs.readFile(geojsonPath, 'utf-8')
  const defaultRoute = JSON.parse(geojsonRaw)

  // Use custom route from Storage if available, otherwise fall back to static file
  const customRoute = await getCustomRoute()
  const routeGeoJson = customRoute ?? defaultRoute

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      <MapWrapper initialPosition={latestPosition} routeGeoJson={routeGeoJson} />
    </div>
  )
}
