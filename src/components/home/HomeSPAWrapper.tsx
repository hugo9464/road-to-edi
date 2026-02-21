'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import type { GpsPosition, Post, SiteSettings } from '@/lib/supabase/types'

const HomeMapClient = dynamic(() => import('./HomeMapClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-stone-100">
      <div className="text-center">
        <div className="text-4xl mb-3">🗺️</div>
        <p className="text-stone-500 text-sm">Chargement de la carte…</p>
      </div>
    </div>
  ),
})

interface FeatureCollection {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    properties: { name: string; totalKm: number; [key: string]: unknown }
    geometry: { type: 'LineString'; coordinates: [number, number][] }
  }>
}

interface HomeSPAWrapperProps {
  initialPosition: GpsPosition | null
  routeGeoJson: FeatureCollection
  posts: Post[]
  settings: SiteSettings | null
  locale: string
  kmCovered: number
  day: number
}

function postExcerpt(md: string, max = 90): string {
  const text = md
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.+?)\]\(.*?\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
  return text.length > max ? text.slice(0, max) + '…' : text
}

export default function HomeSPAWrapper({
  initialPosition,
  routeGeoJson,
  posts,
  settings,
  locale,
  kmCovered,
  day,
}: HomeSPAWrapperProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const postRefs = useRef<Map<string, HTMLElement>>(new Map())

  const totalKm = settings?.total_distance_km ?? 1800
  const instagramHandle = settings?.instagram_handle ?? ''
  const instagramUrl = instagramHandle ? `https://instagram.com/${instagramHandle}` : 'https://instagram.com'
  const donationUrl = settings?.donation_url ?? ''
  const pct = totalKm > 0 ? Math.min(100, Math.round((kmCovered / totalKm) * 100)) : 0

  // Scroll sidebar to selected post when map marker is clicked
  useEffect(() => {
    if (!selectedPostId) return
    const el = postRefs.current.get(selectedPostId)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedPostId])

  function handlePostSelect(id: string) {
    setSelectedPostId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col sm:flex-row h-full overflow-hidden">

      {/* ── Map: 2/3 ── */}
      <div className="h-[55%] sm:h-full sm:w-2/3 flex-none">
        <HomeMapClient
          initialPosition={initialPosition}
          routeGeoJson={routeGeoJson}
          posts={posts}
          locale={locale}
          selectedPostId={selectedPostId}
          onPostSelect={handlePostSelect}
        />
      </div>

      {/* ── Sidebar: 1/3 ── */}
      <aside className="flex-1 sm:w-1/3 sm:flex-none flex flex-col overflow-hidden bg-stone-50 border-t sm:border-t-0 sm:border-l border-stone-200">

        {/* Brand */}
        <div className="px-4 pt-4 pb-3 shrink-0">
          <p className="text-lg font-bold text-stone-800 tracking-tight">🚴 Road to Edi</p>
          <p className="text-xs text-stone-500 mt-0.5">Paris → Edinburgh · ~1 800 km</p>
        </div>

        {/* Quick access buttons */}
        <div className="flex gap-3 px-4 pb-3 shrink-0">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-700 text-stone-100 text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            📸 Instagram
          </a>
          {donationUrl ? (
            <a
              href={donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-800 text-amber-50 text-sm font-semibold hover:bg-amber-900 transition-colors"
            >
              💙 Donner
            </a>
          ) : (
            <Link
              href="/fundraising"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-800 text-amber-50 text-sm font-semibold hover:bg-amber-900 transition-colors"
            >
              💙 Donner
            </Link>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3 shrink-0 border-t border-b border-stone-200 bg-white">
          <div className="flex justify-between text-xs text-stone-400 mb-1.5">
            <span>🇫🇷 Paris</span>
            <span className="font-semibold text-stone-700">
              {kmCovered.toLocaleString('fr-FR')} / {totalKm.toLocaleString('fr-FR')} km
            </span>
            <span>🏴󠁧󠁢󠁳󠁣󠁴󠁿 Edinburgh</span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-700 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(pct, kmCovered > 0 ? 1 : 0)}%` }}
            />
          </div>
          {day > 0 && (
            <p className="text-xs text-stone-400 mt-1.5">Jour {day}</p>
          )}
        </div>

        {/* Post list */}
        <div className="flex-1 overflow-y-auto">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400 p-6 text-center">
              <span className="text-4xl mb-3">📝</span>
              <p className="text-sm">Le voyage n&apos;a pas encore commencé.<br />Revenez bientôt !</p>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {posts.map((post) => {
                const title = (locale === 'en' && post.title_en) ? post.title_en : post.title_fr
                const isSelected = post.id === selectedPostId
                const hasGps = post.lat != null && post.lng != null

                return (
                  <li key={post.id}>
                    <button
                      ref={(el) => {
                        if (el) postRefs.current.set(post.id, el)
                        else postRefs.current.delete(post.id)
                      }}
                      onClick={() => handlePostSelect(post.id)}
                      className={`w-full text-left px-4 py-3 transition-colors border-l-2 ${
                        isSelected
                          ? 'bg-amber-50 border-amber-700'
                          : 'bg-transparent border-transparent hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {post.day != null && (
                              <span className="text-xs font-bold text-amber-800 shrink-0">
                                J{post.day}
                              </span>
                            )}
                            {post.location && (
                              <span className="text-xs text-stone-400 truncate">· {post.location}</span>
                            )}
                            {hasGps && (
                              <span className="ml-auto text-xs text-stone-400 shrink-0" title="Position GPS disponible">
                                📍
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2 mb-1">
                            {title}
                          </p>
                          {post.body_markdown && (
                            <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                              {postExcerpt(post.body_markdown)}
                            </p>
                          )}
                        </div>

                        {/* Thumbnail */}
                        {post.cover_image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.cover_image_url}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover shrink-0 mt-0.5"
                          />
                        )}
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-1.5 inline-block text-xs text-amber-800 hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Lire →
                      </Link>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
