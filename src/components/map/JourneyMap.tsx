'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createClient } from '@/lib/supabase/client'
import type { GpsPosition } from '@/lib/supabase/types'
import { smoothCoordinates } from '@/lib/smoothRoute'
import { useT } from '@/contexts/LanguageContext'

// Fix Leaflet default icon issue in Next.js
import L from 'leaflet'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

interface JourneyMapProps {
  initialPosition: GpsPosition | null
  routeGeoJson: FeatureCollection
}

function findNearestPointIndex(
  coordinates: [number, number][],
  lat: number,
  lng: number
): number {
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

function haversineKm([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function estimateKmProgress(
  coordinates: [number, number][],
  nearestIndex: number,
  boatStartKm: number,
  boatKm: number,
): number {
  if (coordinates.length < 2) return 0
  let km = 0
  for (let i = 1; i <= nearestIndex; i++) km += haversineKm(coordinates[i - 1], coordinates[i])
  const boatEndKm = boatStartKm + boatKm
  if (km > boatEndKm) km -= boatKm
  else if (km > boatStartKm) km = boatStartKm
  return Math.round(km)
}

function RouteLayer({
  routeGeoJson,
  position,
}: {
  routeGeoJson: FeatureCollection
  position: GpsPosition | null
}) {
  const feature = routeGeoJson.features[0]
  if (!feature) return null

  const coordinates = useMemo(() => smoothCoordinates(feature.geometry.coordinates), [feature.geometry.coordinates])
  const totalKm = feature.properties.totalKm

  const { completed, remaining } = useMemo(() => {
    if (!position) {
      return {
        completed: [] as LatLngExpression[],
        remaining: coordinates.map(
          ([lng, lat]) => [lat, lng] as LatLngExpression
        ),
        kmProgress: 0,
      }
    }

    const nearestIdx = findNearestPointIndex(
      coordinates,
      position.lat,
      position.lng
    )
    const boatStartKm = (feature.properties.boatStartKm as number | undefined) ?? 187
    const boatKm = (feature.properties.boatKm as number | undefined) ?? 122
    estimateKmProgress(coordinates, nearestIdx, boatStartKm, boatKm)

    const completedCoords = coordinates
      .slice(0, nearestIdx + 1)
      .map(([lng, lat]) => [lat, lng] as LatLngExpression)
    const remainingCoords = coordinates
      .slice(nearestIdx)
      .map(([lng, lat]) => [lat, lng] as LatLngExpression)

    return { completed: completedCoords, remaining: remainingCoords, kmProgress: 0 }
  }, [coordinates, position, totalKm])

  return (
    <>
      {completed.length > 1 && (
        <Polyline
          positions={completed}
          pathOptions={{ color: '#6b9460', weight: 5, opacity: 0.75 }}
        />
      )}
      {remaining.length > 1 && (
        <Polyline
          positions={remaining}
          pathOptions={{ color: '#e74c3c', weight: 6, opacity: 1 }}
        />
      )}
    </>
  )
}

function CurrentPositionMarker({ position }: { position: GpsPosition }) {
  return (
    <CircleMarker
      center={[position.lat, position.lng]}
      radius={8}
      pathOptions={{
        color: '#fff',
        fillColor: '#bf7856',
        fillOpacity: 0.9,
        weight: 2,
      }}
      className="pulse-marker"
    />
  )
}

export default function JourneyMap({
  initialPosition,
  routeGeoJson,
}: JourneyMapProps) {
  const t = useT()
  const [position, setPosition] = useState<GpsPosition | null>(initialPosition)

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('gps_positions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gps_positions' },
        (payload) => {
          const newPos = payload.new as GpsPosition
          setPosition(newPos)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const feature = routeGeoJson.features[0]
  const coordinates = useMemo(() => smoothCoordinates(feature?.geometry.coordinates ?? []), [feature?.geometry.coordinates])
  const totalKm = feature?.properties.totalKm ?? 1046
  const boatStartKm = (feature?.properties.boatStartKm as number | undefined) ?? 187
  const boatKm = (feature?.properties.boatKm as number | undefined) ?? 122

  const kmProgress = useMemo(() => {
    if (!position || coordinates.length === 0) return 0
    const nearestIdx = findNearestPointIndex(coordinates, position.lat, position.lng)
    return Math.max(0, estimateKmProgress(coordinates, nearestIdx, boatStartKm, boatKm) - 150)
  }, [position, coordinates, boatStartKm, boatKm])

  // Calculate day counter from a start date
  const dayCount = useMemo(() => {
    const startDate = new Date('2026-07-01')
    const now = new Date()
    const diff = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return Math.max(0, diff)
  }, [])

  // Center map on current position or midpoint of route
  const center: LatLngExpression = position
    ? [position.lat, position.lng]
    : [52.5, -0.5]

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={18}
        />
        <RouteLayer routeGeoJson={routeGeoJson} position={position} />
        {position && <CurrentPositionMarker position={position} />}
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-[#fdf8f0]/90 px-4 py-3 shadow-lg backdrop-blur-sm">
        <p className="text-sm font-semibold text-stone-800">
          {kmProgress} / {totalKm} km
        </p>
        <p className="text-xs text-[#7a6550]">
          {dayCount > 0 ? t.map.day(dayCount) : t.map.notStarted}
        </p>
      </div>
    </div>
  )
}
