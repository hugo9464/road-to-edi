import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { uploadCustomRoute, deleteCustomRoute, getCustomRoute } from '@/lib/supabase/route-storage'
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('gpx') as File | null
    if (!file) return NextResponse.json({ error: 'Fichier GPX manquant' }, { status: 400 })

    const isRemaining = formData.get('remaining') === 'true'

    const gpxText = await file.text()
    let coordinates = parseGpx(gpxText)

    if (coordinates.length < 2) {
      return NextResponse.json({ error: 'Le fichier GPX ne contient pas assez de points' }, { status: 400 })
    }

    // Read ferry params and default route
    let boatStartKm = 150, boatKm = 155, boatEndKm = 305
    let defaultRouteData: Record<string, unknown> | null = null
    try {
      defaultRouteData = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'public', 'data', 'route.geojson'), 'utf-8')
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const props = (defaultRouteData as any)?.features?.[0]?.properties ?? {}
      if (props.boatStartKm) boatStartKm = props.boatStartKm
      if (props.boatKm) boatKm = props.boatKm
      boatEndKm = boatStartKm + boatKm
    } catch { /* use defaults */ }

    if (isRemaining) {
      // Fetch the latest GPS position
      const supabase = createAdminClient()
      const { data: gpsData } = await supabase
        .from('gps_positions')
        .select('lat, lng')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (gpsData) {
        // Get current route (custom if exists, otherwise default)
        const customRoute = await getCustomRoute()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentRoute = customRoute ?? defaultRouteData as any
        const currentCoords: [number, number][] = currentRoute?.features?.[0]?.geometry?.coordinates ?? []

        // Preserve ferry params from current route if available
        const currentProps = currentRoute?.features?.[0]?.properties ?? {}
        if (currentProps.boatStartKm) boatStartKm = currentProps.boatStartKm
        if (currentProps.boatKm) boatKm = currentProps.boatKm
        boatEndKm = boatStartKm + boatKm

        if (currentCoords.length > 1) {
          // Find nearest point on current route to GPS position
          const nearestIdx = findNearestPointIndex(currentCoords, gpsData.lat, gpsData.lng)
          // Take the completed portion (start → nearest point to GPS)
          const completedCoords = currentCoords.slice(0, nearestIdx + 1)
          // Combine: completed path + GPS position point + uploaded remaining GPX
          const gpsPoint: [number, number] = [gpsData.lng, gpsData.lat]
          coordinates = [...completedCoords, gpsPoint, ...coordinates]
        } else {
          // No current route, just prepend the GPS position to the uploaded GPX
          const gpsPoint: [number, number] = [gpsData.lng, gpsData.lat]
          coordinates = [gpsPoint, ...coordinates]
        }
      }
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
            boatKm,
            boatStartKm,
            boatEndKm,
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
