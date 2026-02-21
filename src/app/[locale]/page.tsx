import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import fs from 'fs/promises'
import path from 'path'
import { getLatestPosts, getSiteSettings } from '@/lib/supabase/queries'
import { createClient as createSupabase } from '@/lib/supabase/server'
import PostCard from '@/components/blog/PostCard'

export const revalidate = 60

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

function countryFlag(km: number): string {
  if (km < 310) return '🇫🇷'
  if (km < 480) return '🇬🇧'
  if (km < 1600) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
  return '🏴󠁧󠁢󠁳󠁣󠁴󠁿'
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })

  const [postsR, settingsR, gpsR, routeR] = await Promise.allSettled([
    getLatestPosts(3),
    getSiteSettings(),
    (async () => {
      const sb = createSupabase()
      const { data } = await sb
        .from('gps_positions')
        .select('lat, lng')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()
      return data as { lat: number; lng: number } | null
    })(),
    fs.readFile(path.join(process.cwd(), 'public', 'data', 'route.geojson'), 'utf-8')
      .then(JSON.parse),
  ])

  const posts = postsR.status === 'fulfilled' ? postsR.value : []
  const settings = settingsR.status === 'fulfilled' ? settingsR.value : null
  const gps = gpsR.status === 'fulfilled' ? gpsR.value : null
  const routeJson = routeR.status === 'fulfilled' ? routeR.value : null

  const totalKm = settings?.total_distance_km ?? 1800
  const day = dayNumber(settings?.journey_start_date)

  let kmCovered = 0
  if (gps && routeJson) {
    const coords: [number, number][] = routeJson.features?.[0]?.geometry?.coordinates ?? []
    if (coords.length > 0) kmCovered = nearestPointKm(coords, gps.lat, gps.lng, totalKm)
  }

  const pct = totalKm > 0 ? Math.min(100, Math.round((kmCovered / totalKm) * 100)) : 0
  const country = countryFlag(kmCovered)
  const instagramHandle = settings?.instagram_handle ?? ''
  const instagramUrl = instagramHandle
    ? `https://instagram.com/${instagramHandle}`
    : 'https://instagram.com'

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blue-900 via-blue-800 to-blue-600 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center">
          <div className="text-5xl mb-4">🚴</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">{t('title')}</h1>
          <p className="text-xl sm:text-2xl font-medium text-blue-200 mb-4">{t('subtitle')}</p>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto mb-10">{t('tagline')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/map" className="px-8 py-4 bg-white text-blue-700 font-bold rounded-full hover:bg-blue-50 transition-colors text-center shadow-lg">
              🗺️ {t('ctaMap')}
            </Link>
            <Link href="/fundraising" className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors text-center shadow-lg">
              💙 {t('ctaDonate')}
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 C360 0 1080 0 1440 60 L1440 60 L0 60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-blue-600/10 border border-blue-200 rounded-2xl p-4 sm:p-6">
          <div className="mb-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(pct, kmCovered > 0 ? 1 : 0)}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700">{kmCovered.toLocaleString('fr-FR')}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{t('statsKm')}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700">{totalKm.toLocaleString('fr-FR')}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">km total</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700">{day > 0 ? `J${day}` : '—'}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{t('statsDay')}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700">{country}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{t('statsCountry')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey + Instagram */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center">
            <div className="text-5xl shrink-0">🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Paris → Edinburgh</h2>
              <p className="text-gray-600 text-sm sm:text-base">
                France → Angleterre → Écosse · ~1 800 km · ~30 jours
                <br />
                Pour voir <strong>Écosse-France à Murrayfield</strong> et soutenir{' '}
                <strong>Le souci des nôtres</strong>
              </p>
            </div>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              📸 {instagramHandle ? `@${instagramHandle}` : 'Instagram'}
            </a>
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('latestPosts')}</h2>
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            {t('viewAll')} →
          </Link>
        </div>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-sm">Le voyage n&apos;a pas encore commencé. Revenez bientôt&nbsp;!</p>
          </div>
        )}
      </section>
    </div>
  )
}
