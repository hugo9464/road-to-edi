'use client'

import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface FeatureCollection {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    properties: { name: string; totalKm: number; [key: string]: unknown }
    geometry: { type: 'LineString'; coordinates: [number, number][] }
  }>
}

const cities: { name: string; lat: number; lng: number }[] = [
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Londres', lat: 51.5074, lng: -0.1278 },
  { name: 'Édimbourg', lat: 55.9533, lng: -3.1883 },
]

export default function PosterMap({ routeGeoJson }: { routeGeoJson: FeatureCollection }) {
  const feature = routeGeoJson.features[0]
  const coordinates = feature?.geometry.coordinates ?? []
  const routePositions: LatLngExpression[] = coordinates.map(([lng, lat]) => [lat, lng])

  // Center map on the English Channel area to show full route
  const center: LatLngExpression = [52.0, -0.5]

  return (
    <MapContainer
      center={center}
      zoom={6}
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      attributionControl={false}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        maxZoom={18}
      />

      {/* Full route polyline */}
      {routePositions.length > 1 && (
        <Polyline
          positions={routePositions}
          pathOptions={{ color: '#92400e', weight: 4, opacity: 0.8 }}
        />
      )}

      {/* City markers */}
      {cities.map((city) => (
        <CircleMarker
          key={city.name}
          center={[city.lat, city.lng]}
          radius={city.name === 'Paris' || city.name === 'Édimbourg' ? 8 : 6}
          pathOptions={{
            color: '#fff',
            fillColor: '#92400e',
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Tooltip
            permanent
            direction={city.name === 'Paris' ? 'left' : 'right'}
            offset={city.name === 'Paris' ? [-10, 0] : [10, 0]}
            className="poster-city-label"
          >
            {city.name}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
