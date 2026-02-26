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

export interface PostImage {
  id: string
  post_id: string
  url: string
  position: number
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  author: string
  body: string
  created_at: string
}

export interface Banana {
  id: string
  post_id: string
  fingerprint: string
  created_at: string
}

export interface Subscriber {
  id: string
  email: string
  confirm_token: string
  confirmed_at: string | null
  unsubscribe_token: string
  created_at: string
}

export interface PostWithCounts extends Post {
  banana_count: number
  comment_count: number
}

export interface PostWithDetails extends Post {
  images: PostImage[]
  banana_count: number
  comment_count: number
  comments: Comment[]
}
