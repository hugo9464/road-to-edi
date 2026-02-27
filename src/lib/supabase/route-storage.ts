import { createAdminClient } from './admin'

const BUCKET = 'post-images'
const ROUTE_PATH = 'site/route.geojson'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getCustomRoute(): Promise<Record<string, any> | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.storage.from(BUCKET).download(ROUTE_PATH)
    if (error || !data) return null
    return JSON.parse(await data.text())
  } catch {
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadCustomRoute(geojson: Record<string, any>): Promise<void> {
  const supabase = createAdminClient()
  const blob = new Blob([JSON.stringify(geojson)], { type: 'application/json' })
  // Delete first so we can re-insert (service role policy only allows INSERT + DELETE)
  await supabase.storage.from(BUCKET).remove([ROUTE_PATH])
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(ROUTE_PATH, blob, { contentType: 'application/json' })
  if (error) throw new Error(error.message)
}

export async function deleteCustomRoute(): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.storage.from(BUCKET).remove([ROUTE_PATH])
  if (error) throw new Error(error.message)
}
