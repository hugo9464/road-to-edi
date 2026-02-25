'use client'

import dynamic from 'next/dynamic'

const PosterMap = dynamic(() => import('./PosterMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#fdf8f0]">
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
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Full-screen map background */}
      <div className="absolute inset-0">
        <PosterMap routeGeoJson={routeGeoJson} />
      </div>

      {/* Left overlay panel */}
      <div className="absolute top-0 left-0 bottom-0 z-[1000] w-[380px] flex flex-col bg-[#fdf8f0]/85 backdrop-blur-md shadow-2xl px-8 py-10">
        {/* Alfortville Rugby logo */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/images/logo-alfortville.jpeg"
            alt="US Alfortville Rugby"
            className="w-12 h-12 rounded-lg object-contain"
          />
          <span className="text-sm font-semibold text-[#1a2260]">US Alfortville Rugby</span>
        </div>

        {/* Title */}
        <h1 className="font-[family-name:var(--font-lora)] text-4xl font-bold text-amber-900 leading-tight tracking-tight">
          OBJECTIF
          <br />
          MURRAYFIELD
        </h1>
        <p className="mt-2 text-lg text-[#7a6550] font-medium">
          Paris &rarr; Edinburgh à vélo
        </p>

        {/* Distance */}
        <div className="mt-5">
          <p className="text-3xl font-bold text-amber-900 font-[family-name:var(--font-lora)]">1 046 km</p>
          <p className="text-sm text-[#7a6550]">7 étapes · 2 pays</p>
        </div>

        {/* Association — highlighted block */}
        <div className="mt-8 rounded-2xl bg-amber-800 px-6 py-5 text-amber-50 shadow-lg">
          <p className="text-xs uppercase tracking-widest opacity-70 mb-1.5">Au profit de</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-lora)] leading-snug">
            Le Souci des Nôtres
          </p>
          <p className="text-sm mt-2 opacity-80 leading-relaxed">
            Association solidaire &amp; humanitaire
          </p>
        </div>
      </div>
    </div>
  )
}
