import type { Metadata } from 'next'
import fs from 'fs/promises'
import path from 'path'
import { getSiteSettings, getAllPostsWithCounts } from '@/lib/supabase/queries'
import { createClient as createSupabase } from '@/lib/supabase/server'
import type { GpsPosition } from '@/lib/supabase/types'
import HomeSPAWrapper from '@/components/home/HomeSPAWrapper'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Objectif Murrayfield',
  description: 'Paris → Édimbourg à vélo — un voyage de 1 046 km au profit de « Le Souci des Nôtres »',
  openGraph: { title: 'Objectif Murrayfield — Paris → Edinburgh', description: 'Paris → Édimbourg à vélo' },
}

function haversineKm([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function nearestPointKm(
  coords: [number, number][],
  lat: number,
  lng: number,
  boatStartKm: number,
  boatKm: number,
): number {
  let minD = Infinity, minIdx = 0
  for (let i = 0; i < coords.length; i++) {
    const d = (coords[i][1] - lat) ** 2 + (coords[i][0] - lng) ** 2
    if (d < minD) { minD = d; minIdx = i }
  }
  let km = 0
  for (let i = 1; i <= minIdx; i++) km += haversineKm(coords[i - 1], coords[i])
  const boatEndKm = boatStartKm + boatKm
  if (km > boatEndKm) km -= boatKm
  else if (km > boatStartKm) km = boatStartKm
  return Math.round(km)
}

function dayNumber(startDate?: string | null): number {
  if (!startDate) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / 86_400_000))
}

export default async function HomePage() {
  const [settingsR, gpsR, routeR, postsR] = await Promise.allSettled([
    getSiteSettings(),
    (async () => {
      const sb = createSupabase()
      const { data } = await sb
        .from('gps_positions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()
      return data as GpsPosition | null
    })(),
    fs.readFile(path.join(process.cwd(), 'public', 'data', 'route.geojson'), 'utf-8').then(JSON.parse),
    getAllPostsWithCounts(),
  ])

  const settings = settingsR.status === 'fulfilled' ? settingsR.value : null
  const gps = gpsR.status === 'fulfilled' ? gpsR.value : null
  const routeJson = routeR.status === 'fulfilled'
    ? routeR.value
    : { type: 'FeatureCollection', features: [] }
  const posts = postsR.status === 'fulfilled' ? postsR.value : []

  const day = dayNumber(settings?.journey_start_date)

  let kmCovered = 0
  if (gps && routeJson?.features?.[0]) {
    const coords: [number, number][] = routeJson.features[0].geometry?.coordinates ?? []
    const boatStartKm: number = routeJson.features[0].properties?.boatStartKm ?? 187
    const boatKm: number = routeJson.features[0].properties?.boatKm ?? 122
    if (coords.length > 0) kmCovered = nearestPointKm(coords, gps.lat, gps.lng, boatStartKm, boatKm)
  }

  return (
    <div className="h-svh overflow-hidden">
      <HomeSPAWrapper
        initialPosition={gps}
        routeGeoJson={routeJson}
        settings={settings}
        kmCovered={kmCovered}
        day={day}
        posts={posts}
      />
    </div>
  )
}
