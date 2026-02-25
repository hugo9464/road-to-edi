import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://road-to-edi.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/map', priority: 0.9, freq: 'always' as const },
    { path: '/fundraising', priority: 0.8, freq: 'weekly' as const },
    { path: '/about', priority: 0.6, freq: 'weekly' as const },
  ]

  return staticPages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.freq,
    priority: page.priority,
  }))
}
