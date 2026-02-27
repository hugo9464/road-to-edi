import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

function haversineKm([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function parseGpx(gpxText: string): [number, number][] {
  const coords: [number, number][] = []
  // Match <trkpt lat="..." lon="..."> or <wpt lat="..." lon="...">
  const trkptRegex = /<(?:trkpt|wpt)\s[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"/g
  const trkptRegex2 = /<(?:trkpt|wpt)\s[^>]*lon="([^"]+)"[^>]*lat="([^"]+)"/g

  let match: RegExpExecArray | null

  // Try lat first variant
  const matches1: [number, number][] = []
  while ((match = trkptRegex.exec(gpxText)) !== null) {
    const lat = parseFloat(match[1])
    const lon = parseFloat(match[2])
    if (!isNaN(lat) && !isNaN(lon)) {
      matches1.push([lon, lat]) // GeoJSON: [lng, lat]
    }
  }

  // Try lon first variant
  const matches2: [number, number][] = []
  while ((match = trkptRegex2.exec(gpxText)) !== null) {
    const lon = parseFloat(match[1])
    const lat = parseFloat(match[2])
    if (!isNaN(lat) && !isNaN(lon)) {
      matches2.push([lon, lat])
    }
  }

  // Use whichever found more points
  const points = matches1.length >= matches2.length ? matches1 : matches2
  coords.push(...points)

  return coords
}

function totalDistanceKm(coords: [number, number][]): number {
  let total = 0
  for (let i = 1; i < coords.length; i++) {
    total += haversineKm(coords[i - 1], coords[i])
  }
  return Math.round(total)
}

export async function POST(request: Request) {
  const authed = await isAdminAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('gpx') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Fichier GPX manquant' }, { status: 400 })
    }

    const gpxText = await file.text()

    const coordinates = parseGpx(gpxText)

    if (coordinates.length < 2) {
      return NextResponse.json({ error: 'Le fichier GPX ne contient pas assez de points' }, { status: 400 })
    }

    const distanceKm = totalDistanceKm(coordinates)

    const routeGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: file.name.replace(/\.gpx$/i, ''),
            totalKm: distanceKm,
            boatKm: 0,
            boatStartKm: distanceKm + 1,
            boatEndKm: distanceKm + 1,
          },
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      ],
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1,
        route_geojson: routeGeoJson,
        total_distance_km: distanceKm,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, points: coordinates.length, distanceKm })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const authed = await isAdminAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('site_settings')
    .update({ route_geojson: null })
    .eq('id', 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
