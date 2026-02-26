'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Tooltip } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createClient } from '@/lib/supabase/client'
import type { GpsPosition, PostWithCounts } from '@/lib/supabase/types'
import { smoothCoordinates } from '@/lib/smoothRoute'
import L from 'leaflet'

/* ── Countdown to Scotland v France — 7 Mar 2026, 15:10 CET (14:10 UTC) ── */
const MATCH_UTC = new Date('2026-03-07T14:10:00Z').getTime()

function useCountdown() {
  const [remaining, setRemaining] = useState(() => MATCH_UTC - Date.now())
  useEffect(() => {
    const id = setInterval(() => setRemaining(MATCH_UTC - Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  if (remaining <= 0) return null
  const d = Math.floor(remaining / 86_400_000)
  const h = Math.floor((remaining % 86_400_000) / 3_600_000)
  const m = Math.floor((remaining % 3_600_000) / 60_000)
  const s = Math.floor((remaining % 60_000) / 1000)
  return { d, h, m, s }
}

const pad = (n: number) => String(n).padStart(2, '0')

const flagIcon = L.divIcon({
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#1e3a5f;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>',
})

// Fix Leaflet default icon in Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface FeatureCollection {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    properties: { name: string; totalKm: number; [key: string]: unknown }
    geometry: { type: 'LineString'; coordinates: [number, number][] }
  }>
}

interface HomeMapClientProps {
  initialPosition: GpsPosition | null
  routeGeoJson: FeatureCollection
  posts: PostWithCounts[]
  onPostClick: (postId: string) => void
}

function findNearestPointIndex(coordinates: [number, number][], lat: number, lng: number): number {
  let minDist = Infinity
  let minIndex = 0
  for (let i = 0; i < coordinates.length; i++) {
    const [cLng, cLat] = coordinates[i]
    const dist = (cLat - lat) ** 2 + (cLng - lng) ** 2
    if (dist < minDist) {
      minDist = dist
      minIndex = i
    }
  }
  return minIndex
}

function EndpointCountdown({ coordinates }: { coordinates: [number, number][] }) {
  const cd = useCountdown()
  if (!cd || coordinates.length === 0) return null
  const last = coordinates[coordinates.length - 1]
  const endPoint: LatLngExpression = [last[1], last[0]]
  return (
    <Marker position={endPoint} icon={flagIcon}>
      <Tooltip permanent direction="right" offset={[14, 0]} className="countdown-tooltip">
        <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1e3a5f', letterSpacing: 1, marginBottom: 3 }}>
            🏟️ Murrayfield
          </div>
          <div style={{ fontSize: 28, marginBottom: 2, letterSpacing: 4 }}>
            🏴󠁧󠁢󠁳󠁣󠁴󠁿 – 🇫🇷
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#78350f', marginBottom: 3 }}>
            Coup d&apos;envoi dans
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#78350f', fontVariantNumeric: 'tabular-nums' }}>
            {pad(cd.d)}j {pad(cd.h)}h {pad(cd.m)}m {pad(cd.s)}s
          </div>
        </div>
      </Tooltip>
    </Marker>
  )
}

export default function HomeMapClient({
  initialPosition,
  routeGeoJson,
  posts,
  onPostClick,
}: HomeMapClientProps) {
  const [position, setPosition] = useState<GpsPosition | null>(initialPosition)

  // Realtime GPS subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('home_gps')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gps_positions' }, (payload) => {
        setPosition(payload.new as GpsPosition)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const feature = routeGeoJson.features[0]
  const rawCoordinates = feature?.geometry.coordinates ?? []
  const coordinates = useMemo(() => smoothCoordinates(rawCoordinates), [rawCoordinates])

  const { completed, remaining } = useMemo(() => {
    if (!position || coordinates.length === 0) {
      return {
        completed: [] as LatLngExpression[],
        remaining: coordinates.map(([lng, lat]) => [lat, lng] as LatLngExpression),
      }
    }
    const nearestIdx = findNearestPointIndex(coordinates, position.lat, position.lng)
    return {
      completed: coordinates.slice(0, nearestIdx + 1).map(([lng, lat]) => [lat, lng] as LatLngExpression),
      remaining: coordinates.slice(nearestIdx).map(([lng, lat]) => [lat, lng] as LatLngExpression),
    }
  }, [position, coordinates])

  const center: LatLngExpression = position ? [position.lat, position.lng] : [52.5, -0.5]

  return (
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={6} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={18}
        />

        {completed.length > 1 && (
          <Polyline positions={completed} pathOptions={{ color: '#6b9460', weight: 5, opacity: 0.75 }} />
        )}
        {remaining.length > 1 && (
          <Polyline positions={remaining} pathOptions={{ color: '#b07a50', weight: 4, opacity: 0.7, dashArray: '12 6' }} />
        )}

        {position && (
          <CircleMarker
            center={[position.lat, position.lng]}
            radius={9}
            pathOptions={{ color: '#fff', fillColor: '#bf7856', fillOpacity: 0.9, weight: 2 }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]} className="hugo-tooltip">
              🚴 Hugo
            </Tooltip>
          </CircleMarker>
        )}

        {/* Post markers */}
        {posts.map((post) => (
          <CircleMarker
            key={post.id}
            center={[post.lat!, post.lng!]}
            radius={7}
            pathOptions={{ color: '#fff', fillColor: '#ea580c', fillOpacity: 0.9, weight: 2 }}
            eventHandlers={{ click: () => onPostClick(post.id) }}
          >
            <Tooltip permanent interactive direction="top" offset={[0, -8]} className="post-tooltip"
              eventHandlers={{ click: () => onPostClick(post.id) }}
            >
              <span className="post-tooltip-label">{post.title_fr} ›</span>
            </Tooltip>
          </CircleMarker>
        ))}

        <EndpointCountdown coordinates={coordinates} />
      </MapContainer>

    </div>
  )
}
