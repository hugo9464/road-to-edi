'use client'

import dynamic from 'next/dynamic'
import { useRef, useCallback } from 'react'
import { toPng } from 'html-to-image'

const PosterMap = dynamic(() => import('./PosterMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-[#fdf8f0]" style={{ width: 1200, height: 630 }}>
      <p className="text-stone-400 text-sm">Chargement…</p>
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

export default function PosterClient({ routeGeoJson }: { routeGeoJson: FeatureCollection }) {
  const posterRef = useRef<HTMLDivElement>(null)

  const handleDownload = useCallback(async () => {
    if (!posterRef.current) return
    const dataUrl = await toPng(posterRef.current, {
      width: 1200,
      height: 630,
      pixelRatio: 2,
    })
    const link = document.createElement('a')
    link.download = 'objectif-murrayfield.png'
    link.href = dataUrl
    link.click()
  }, [])

  return (
    <div className="min-h-screen bg-stone-200 flex flex-col items-center justify-center gap-6 p-8">
      {/* Poster — fixed 1200×630 */}
      <div
        ref={posterRef}
        className="relative overflow-hidden shadow-2xl"
        style={{ width: 1200, height: 630 }}
      >
        {/* Full map background */}
        <div className="absolute inset-0">
          <PosterMap routeGeoJson={routeGeoJson} />
        </div>

        {/* Left overlay panel */}
        <div className="absolute top-0 left-0 bottom-0 z-[1000] w-[420px] flex flex-col bg-[#fdf8f0]/88 backdrop-blur-md shadow-2xl px-10 py-10">
          {/* Alfortville Rugby logo */}
          <div className="flex items-center gap-5 mb-8">
            <img
              src="/images/logo-alfortville.jpeg"
              alt="US Alfortville Rugby"
              className="w-20 h-20 rounded-xl object-contain shadow-md"
            />
            <span className="text-xl font-bold text-[#1a2260] leading-tight">US Alfortville<br />Rugby</span>
          </div>

          {/* Title */}
          <h1 className="font-[family-name:var(--font-lora)] text-6xl font-bold text-amber-900 leading-[1.05] tracking-tight">
            OBJECTIF
            <br />
            MURRAYFIELD
          </h1>
          <p className="mt-3 text-xl text-[#7a6550] font-medium">
            Paris &rarr; Edinburgh à vélo
          </p>

          {/* Distance */}
          <div className="mt-6">
            <p className="text-5xl font-bold text-amber-900 font-[family-name:var(--font-lora)]">1 046 km</p>
            <p className="text-base text-[#7a6550] mt-1">7 étapes · 2 pays</p>
          </div>

          {/* Association — highlighted block */}
          <div className="mt-auto rounded-2xl bg-amber-800 px-7 py-5 text-amber-50 shadow-lg">
            <p className="text-xs uppercase tracking-widest opacity-70 mb-1.5">Au profit de</p>
            <p className="text-3xl font-bold font-[family-name:var(--font-lora)] leading-snug">
              Le Souci des Nôtres
            </p>
            <p className="text-base mt-2 opacity-80 leading-relaxed">
              Association solidaire &amp; humanitaire
            </p>
          </div>
        </div>
      </div>

      {/* Download button — outside poster ref */}
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-3.5 text-amber-50 font-semibold shadow-lg hover:bg-amber-900 transition-colors cursor-pointer text-lg"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Télécharger l&apos;image
      </button>
    </div>
  )
}
