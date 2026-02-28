import { NextResponse } from 'next/server'
import { getCustomRoute, uploadCustomRoute } from '@/lib/supabase/route-storage'

export async function PATCH(request: Request) {
  try {
    const { boatStartKm, boatKm } = await request.json()

    if (typeof boatStartKm !== 'number' || typeof boatKm !== 'number') {
      return NextResponse.json({ error: 'boatStartKm et boatKm sont requis (nombres)' }, { status: 400 })
    }

    const stored = await getCustomRoute()
    if (!stored) {
      return NextResponse.json({ error: 'Aucune trace personnalisée stockée' }, { status: 404 })
    }

    stored.features[0].properties.boatStartKm = boatStartKm
    stored.features[0].properties.boatKm = boatKm
    stored.features[0].properties.boatEndKm = boatStartKm + boatKm

    await uploadCustomRoute(stored)
    return NextResponse.json({ ok: true, boatStartKm, boatKm, boatEndKm: boatStartKm + boatKm })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}
