'use client'

import dynamic from 'next/dynamic'
import type { GpsPosition } from '@/lib/supabase/types'

// ssr: false must live in a Client Component in Next.js 16+
const JourneyMap = dynamic(() => import('./JourneyMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="text-3xl mb-2">🗺️</div>
        <p className="text-gray-500">Loading map...</p>
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

interface MapWrapperProps {
  initialPosition: GpsPosition | null
  routeGeoJson: FeatureCollection
}

export default function MapWrapper({ initialPosition, routeGeoJson }: MapWrapperProps) {
  return <JourneyMap initialPosition={initialPosition} routeGeoJson={routeGeoJson} />
}
