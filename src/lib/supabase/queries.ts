import { createClient } from './server'
import type { Post, SiteSettings } from './types'

export async function getLatestPosts(n = 3): Promise<Post[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(n)
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false })
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) return null
    return data
  } catch {
    return null
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (error) return null
    return data
  } catch {
    return null
  }
}
