import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { Post } from '@/lib/supabase/types'

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function excerpt(markdown: string, max = 120): string {
  // Strip markdown syntax for preview
  const text = markdown
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.+?)\]\(.*?\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
  return text.length > max ? text.slice(0, max) + '…' : text
}

interface PostCardProps {
  post: Post
  locale: string
}

export default function PostCard({ post, locale }: PostCardProps) {
  const title = (locale === 'en' && post.title_en) ? post.title_en : post.title_fr

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <span className="text-4xl">📸</span>
          </div>
        )}
        {post.day != null && (
          <span className="absolute top-3 left-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow">
            Jour {post.day}
          </span>
        )}
      </div>

      <div className="p-4">
        {post.location && (
          <p className="mb-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
            📍 {post.location}
          </p>
        )}
        <h3 className="mb-1 text-base font-bold text-gray-900 group-hover:text-blue-600 leading-snug">
          {title}
        </h3>
        <time className="mb-2 block text-xs text-gray-400">
          {formatDate(post.published_at, locale)}
        </time>
        {post.body_markdown && (
          <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">
            {excerpt(post.body_markdown)}
          </p>
        )}
      </div>
    </Link>
  )
}
