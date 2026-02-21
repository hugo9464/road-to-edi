export interface GpsPosition {
  id: number
  lat: number
  lng: number
  accuracy: number | null
  timestamp: string
  source: 'pwa' | 'manual'
}

export interface Post {
  id: string
  title_fr: string
  title_en: string | null
  slug: string
  published_at: string
  day: number | null
  location: string | null
  lat: number | null
  lng: number | null
  cover_image_url: string | null
  body_markdown: string
  created_at: string
  updated_at: string
}

export interface SiteSettings {
  id: 1
  journey_start_date: string | null
  total_distance_km: number
  instagram_handle: string
  donation_url: string
  fundraising_goal: number
  fundraising_current: number
}
