import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin/auth'
import { uploadCustomRoute, deleteCustomRoute } from '@/lib/supabase/route-storage'

function haversineKm([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function parseGpx(gpxText: string): [number, number][] {
  const coords: [number, number][] = []
  // Match <trkpt lat="..." lon="..."> with any attribute order
  const re = /<(?:trkpt|wpt)\b([^>]*)>/g
  let match: RegExpExecArray | null
  while ((match = re.exec(gpxText)) !== null) {
    const attrs = match[1]
    const latM = /lat="([^"]+)"/.exec(attrs)
    const lonM = /lon="([^"]+)"/.exec(attrs)
    if (latM && lonM) {
      const lat = parseFloat(latM[1])
      const lon = parseFloat(lonM[1])
      if (!isNaN(lat) && !isNaN(lon)) coords.push([lon, lat]) // GeoJSON: [lng, lat]
    }
  }
  return coords
}

function totalDistanceKm(coords: [number, number][]): number {
  let total = 0
  for (let i = 1; i < coords.length; i++) total += haversineKm(coords[i - 1], coords[i])
  return Math.round(total)
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('gpx') as File | null
    if (!file) return NextResponse.json({ error: 'Fichier GPX manquant' }, { status: 400 })

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
          geometry: { type: 'LineString', coordinates },
        },
      ],
    }

    await uploadCustomRoute(routeGeoJson)
    return NextResponse.json({ ok: true, points: coordinates.length, distanceKm })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  try {
    await deleteCustomRoute()
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}
