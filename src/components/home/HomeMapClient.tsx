'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createClient } from '@/lib/supabase/client'
import type { GpsPosition, Post } from '@/lib/supabase/types'
import L from 'leaflet'
import { Link } from '@/i18n/navigation'

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
  posts: Post[]
  locale: string
  selectedPostId: string | null
  onPostSelect: (id: string) => void
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

// Pans map to selected post marker
function MapController({ selectedPostId, posts }: { selectedPostId: string | null; posts: Post[] }) {
  const map = useMap()
  useEffect(() => {
    if (!selectedPostId) return
    const post = posts.find((p) => p.id === selectedPostId)
    if (post?.lat != null && post?.lng != null) {
      map.panTo([post.lat, post.lng], { animate: true, duration: 0.8 })
    }
  }, [selectedPostId, posts, map])
  return null
}

export default function HomeMapClient({
  initialPosition,
  routeGeoJson,
  posts,
  locale,
  selectedPostId,
  onPostSelect,
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
  const coordinates = feature?.geometry.coordinates ?? []
  const totalKm = feature?.properties.totalKm ?? 1800

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
  const postsWithGps = posts.filter((p) => p.lat != null && p.lng != null)

  return (
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={6} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Route: completed (amber-brown) + remaining (stone dashed) */}
        {completed.length > 1 && (
          <Polyline positions={completed} pathOptions={{ color: '#92400e', weight: 4 }} />
        )}
        {remaining.length > 1 && (
          <Polyline positions={remaining} pathOptions={{ color: '#a8a29e', weight: 3, dashArray: '8 8' }} />
        )}

        {/* Current GPS position */}
        {position && (
          <CircleMarker
            center={[position.lat, position.lng]}
            radius={9}
            pathOptions={{ color: '#fff', fillColor: '#c2410c', fillOpacity: 0.95, weight: 2 }}
          />
        )}

        {/* Post markers */}
        {postsWithGps.map((post) => {
          const isSelected = post.id === selectedPostId
          const title = (locale === 'en' && post.title_en) ? post.title_en : post.title_fr
          return (
            <CircleMarker
              key={post.id}
              center={[post.lat!, post.lng!]}
              radius={isSelected ? 11 : 7}
              pathOptions={{
                color: '#fff',
                fillColor: isSelected ? '#b45309' : '#78350f',
                fillOpacity: 0.95,
                weight: isSelected ? 2.5 : 1.5,
              }}
              eventHandlers={{ click: () => onPostSelect(post.id) }}
            >
              <Popup>
                <div className="min-w-[180px] py-1">
                  {post.day != null && (
                    <p className="text-xs font-semibold text-orange-500 mb-1">
                      Jour {post.day}{post.location ? ` · ${post.location}` : ''}
                    </p>
                  )}
                  <p className="text-sm font-bold text-gray-900 mb-2 leading-snug">{title}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Lire la suite →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

        <MapController selectedPostId={selectedPostId} posts={posts} />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 shadow backdrop-blur-sm text-xs text-stone-600">
          <span className="inline-block w-3 h-0.5 bg-amber-800 rounded" />
          Parcouru
        </div>
        {postsWithGps.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 shadow backdrop-blur-sm text-xs text-stone-600">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-800" />
            Posts
          </div>
        )}
      </div>
    </div>
  )
}
