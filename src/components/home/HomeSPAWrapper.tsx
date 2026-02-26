'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import Link from 'next/link'

import type { GpsPosition, SiteSettings, PostWithCounts } from '@/lib/supabase/types'
import JournalOverlay from '@/components/journal/JournalOverlay'

const HomeMapClient = dynamic(() => import('./HomeMapClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-stone-100">
      <p className="text-stone-500 text-sm">Chargement de la carte…</p>
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
  settings: SiteSettings | null
  kmCovered: number
  day: number
  posts: PostWithCounts[]
}

export default function HomeSPAWrapper({
  initialPosition,
  routeGeoJson,
  settings,
  kmCovered,
  day,
  posts,
}: HomeSPAWrapperProps) {
  const [donationOpen, setDonationOpen] = useState(false)
  const [journalOpen, setJournalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const totalKm = settings?.total_distance_km ?? 1046
  const instagramUrl = 'https://www.instagram.com/hugo_a_velo/'
  const donationUrl = settings?.donation_url || 'https://www.helloasso.com/associations/le-souci-des-notres/formulaires/1'
  const pct = totalKm > 0 ? Math.min(100, Math.round((kmCovered / totalKm) * 100)) : 0

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId)
    setJournalOpen(true)
  }

  // Posts that have GPS coordinates (for map markers)
  const mapPosts = posts.filter((p) => p.lat != null && p.lng != null)

  return (
    <div className="relative h-full w-full">

      {/* ── Map (fullscreen) ── */}
      <div className="absolute inset-0">
        <HomeMapClient
          initialPosition={initialPosition}
          routeGeoJson={routeGeoJson}
          posts={mapPosts}
          onPostClick={handlePostClick}
        />
      </div>

      {/* ── Top-center: Donation + Instagram & Club logo ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 sm:flex-row sm:items-end sm:gap-3">
        {/* Donation (top on mobile, center on desktop) */}
        <button
          onClick={() => setDonationOpen(true)}
          className="order-first sm:order-2 px-5 py-3 rounded-2xl bg-orange-600/90 backdrop-blur-sm text-white text-center shadow-lg hover:bg-orange-700 hover:scale-105 transition-all duration-200"
        >
          <span className="text-2xl leading-none">🤝</span>
          <br />
          <span className="text-xs opacity-90">Soutenir l&apos;association</span>
          <br />
          <span className="text-sm font-bold tracking-wide">Le Souci des Nôtres</span>
        </button>

        {/* Instagram + Alfortville row (below on mobile, flanking on desktop) */}
        <div className="flex items-center gap-2 sm:contents">
          {/* Instagram (left) */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:order-1 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-md text-white text-xs font-semibold hover:scale-105 transition-transform duration-200"
            style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="shrink-0">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Suivre l&apos;aventure
          </a>

          {/* Alfortville Rugby (right) */}
          <a
            href="https://usalfortvillerugby.ffr.fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:order-3 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-md bg-white/90 backdrop-blur-sm text-[#1a2260] text-xs font-semibold hover:scale-105 transition-transform duration-200"
          >
            <img
              src="/images/logo-alfortville.jpeg"
              alt="US Alfortville Rugby"
              className="w-8 h-8 object-contain shrink-0"
            />
            <span className="hidden sm:inline">Alfortville Rugby</span>
          </a>
        </div>
      </div>

      {/* ── Bottom: progress bar + journal button ── */}
      <div className="absolute bottom-6 left-4 right-4 z-[1000] sm:left-1/2 sm:-translate-x-1/2 sm:w-96 sm:right-auto">
        {/* Journal button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => { setSelectedPostId(null); setJournalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-800/90 backdrop-blur-sm text-amber-50 text-sm font-semibold shadow-lg hover:bg-amber-900 hover:scale-105 transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Journal de bord
            {posts.length > 0 && (
              <span className="bg-amber-50 text-amber-800 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {posts.length}
              </span>
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div className="rounded-xl bg-[#fdf8f0]/90 backdrop-blur-sm px-4 py-3 shadow-md">
          <div className="flex justify-between text-xs text-stone-400 mb-1.5">
            <span>Paris</span>
            <span className="font-semibold text-stone-700">
              {kmCovered.toLocaleString('fr-FR')} / {totalKm.toLocaleString('fr-FR')} km
            </span>
            <span>Edinburgh</span>
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
      </div>

      {/* ── Journal overlay ── */}
      {journalOpen && (
        <JournalOverlay
          posts={posts}
          selectedPostId={selectedPostId}
          onClose={() => { setJournalOpen(false); setSelectedPostId(null) }}
        />
      )}

      {/* ── Donation modal ── */}
      {donationOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4"
          onClick={() => setDonationOpen(false)}
        >
          <div
            className="bg-[#fdf8f0] rounded-2xl shadow-xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDonationOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
              aria-label="Fermer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h2 className="font-[family-name:var(--font-lora)] text-xl font-bold text-amber-900 mb-4">
              Le Souci Des Nôtres
            </h2>
            <p className="text-sm text-[#7a6550] leading-relaxed mb-6">
              «&nbsp;Le Souci des Nôtres&nbsp;», basée à Alfortville, est une association qui lutte contre la pauvreté et la précarité par des actions comme des récoltes et distributions de produits de nécessité mais aussi des maraudes dans Paris.
            </p>
            {donationUrl ? (
              <a
                href={donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 rounded-xl bg-amber-800 text-amber-50 font-semibold hover:bg-amber-900 transition-colors"
              >
                Faire un don
              </a>
            ) : (
              <Link
                href="/fundraising"
                onClick={() => setDonationOpen(false)}
                className="block w-full text-center py-3 rounded-xl bg-amber-800 text-amber-50 font-semibold hover:bg-amber-900 transition-colors"
              >
                Faire un don
              </Link>
            )}
            <p className="text-[11px] text-[#a0937e] text-center mt-3 leading-snug">
              Déductible à 66&nbsp;% des impôts — un don de 10&nbsp;€ ne vous coûte que 3,40&nbsp;€
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
