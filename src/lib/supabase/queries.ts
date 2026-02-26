import { createClient } from './server'
import type { Post, PostWithCounts, PostWithDetails, SiteSettings } from './types'

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

export async function getAllPostsWithCounts(): Promise<PostWithCounts[]> {
  try {
    const supabase = createClient()
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false })
    if (error || !posts) return []

    const postIds = posts.map((p) => p.id)
    if (postIds.length === 0) return posts.map((p) => ({ ...p, banana_count: 0, comment_count: 0 }))

    // Count bananas per post
    const { data: bananaRows } = await supabase
      .from('bananas')
      .select('post_id')
      .in('post_id', postIds)
    const bananaCounts: Record<string, number> = {}
    for (const row of bananaRows ?? []) {
      bananaCounts[row.post_id] = (bananaCounts[row.post_id] ?? 0) + 1
    }

    // Count comments per post
    const { data: commentRows } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds)
    const commentCounts: Record<string, number> = {}
    for (const row of commentRows ?? []) {
      commentCounts[row.post_id] = (commentCounts[row.post_id] ?? 0) + 1
    }

    // Fetch first image per post
    const { data: imageRows } = await supabase
      .from('post_images')
      .select('post_id, url')
      .in('post_id', postIds)
      .order('position', { ascending: true })
    const firstImage: Record<string, string> = {}
    for (const row of imageRows ?? []) {
      if (!firstImage[row.post_id]) firstImage[row.post_id] = row.url
    }

    return posts.map((p) => ({
      ...p,
      cover_image_url: p.cover_image_url || firstImage[p.id] || null,
      banana_count: bananaCounts[p.id] ?? 0,
      comment_count: commentCounts[p.id] ?? 0,
    }))
  } catch {
    return []
  }
}

export async function getPostWithDetails(id: string): Promise<PostWithDetails | null> {
  try {
    const supabase = createClient()
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !post) return null

    const [imagesR, commentsR, bananasR] = await Promise.all([
      supabase.from('post_images').select('*').eq('post_id', id).order('position'),
      supabase.from('comments').select('*').eq('post_id', id).order('created_at', { ascending: true }),
      supabase.from('bananas').select('id').eq('post_id', id),
    ])

    return {
      ...post,
      images: imagesR.data ?? [],
      comments: commentsR.data ?? [],
      banana_count: bananasR.data?.length ?? 0,
      comment_count: commentsR.data?.length ?? 0,
    }
  } catch {
    return null
  }
}

export async function getPostsForMap(): Promise<Pick<Post, 'id' | 'title_fr' | 'lat' | 'lng'>[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('id, title_fr, lat, lng')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .order('published_at', { ascending: false })
    if (error) return []
    return data ?? []
  } catch {
    return []
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
