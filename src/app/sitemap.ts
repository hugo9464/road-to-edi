import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/supabase/queries'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://road-to-edi.vercel.app'
const LOCALES = ['fr', 'en'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = []

  const staticPages = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/map', priority: 0.9, freq: 'always' as const },
    { path: '/blog', priority: 0.8, freq: 'daily' as const },
    { path: '/fundraising', priority: 0.8, freq: 'weekly' as const },
    { path: '/about', priority: 0.6, freq: 'weekly' as const },
  ]

  for (const locale of LOCALES) {
    for (const page of staticPages) {
      routes.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.freq,
        priority: page.priority,
      })
    }
  }

  const posts = await getAllPosts()
  for (const post of posts) {
    for (const locale of LOCALES) {
      routes.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  return routes
}
