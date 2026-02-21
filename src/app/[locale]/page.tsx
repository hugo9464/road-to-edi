import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import fs from 'fs/promises'
import path from 'path'
import { getAllPosts, getSiteSettings } from '@/lib/supabase/queries'
import { createClient as createSupabase } from '@/lib/supabase/server'
import type { GpsPosition } from '@/lib/supabase/types'
import HomeSPAWrapper from '@/components/home/HomeSPAWrapper'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  return {
    title: t('title'),
    description: t('tagline'),
    openGraph: { title: 'Road to Edi — Paris → Edinburgh', description: t('tagline') },
  }
}

function nearestPointKm(coords: [number, number][], lat: number, lng: number, total: number) {
  let minD = Infinity, minIdx = 0
  for (let i = 0; i < coords.length; i++) {
    const d = (coords[i][1] - lat) ** 2 + (coords[i][0] - lng) ** 2
    if (d < minD) { minD = d; minIdx = i }
  }
  return Math.round((minIdx / Math.max(coords.length - 1, 1)) * total)
}

function dayNumber(startDate?: string | null): number {
  if (!startDate) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / 86_400_000))
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const [postsR, settingsR, gpsR, routeR] = await Promise.allSettled([
    getAllPosts(),
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
  ])

  const posts = postsR.status === 'fulfilled' ? postsR.value : []
  const settings = settingsR.status === 'fulfilled' ? settingsR.value : null
  const gps = gpsR.status === 'fulfilled' ? gpsR.value : null
  const routeJson = routeR.status === 'fulfilled'
    ? routeR.value
    : { type: 'FeatureCollection', features: [] }

  const totalKm = settings?.total_distance_km ?? 1800
  const day = dayNumber(settings?.journey_start_date)

  let kmCovered = 0
  if (gps && routeJson?.features?.[0]) {
    const coords: [number, number][] = routeJson.features[0].geometry?.coordinates ?? []
    if (coords.length > 0) kmCovered = nearestPointKm(coords, gps.lat, gps.lng, totalKm)
  }

  return (
    <div className="h-svh overflow-hidden">
      <HomeSPAWrapper
        initialPosition={gps}
        routeGeoJson={routeJson}
        posts={posts}
        settings={settings}
        locale={locale}
        kmCovered={kmCovered}
        day={day}
      />
    </div>
  )
}
