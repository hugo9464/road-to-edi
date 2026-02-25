import { promises as fs } from 'fs'
import path from 'path'
import PosterClient from '@/components/poster/PosterClient'

export default async function PosterPage() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'route.geojson')
  const raw = await fs.readFile(filePath, 'utf-8')
  const routeGeoJson = JSON.parse(raw)

  return <PosterClient routeGeoJson={routeGeoJson} />
}
