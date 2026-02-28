'use client'

import type { PostWithCounts } from '@/lib/supabase/types'
import type { Lang } from '@/contexts/LanguageContext'

interface PostCardProps {
  post: PostWithCounts
  onClick: () => void
  highlighted?: boolean
  lang?: Lang
}

export default function PostCard({ post, onClick, highlighted, lang = 'fr' }: PostCardProps) {
  const date = new Date(post.published_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'short',
  })

  const title = lang === 'en' && post.title_en ? post.title_en : post.title_fr

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex gap-3 p-3 rounded-xl transition-colors ${
        highlighted
          ? 'bg-amber-50 ring-2 ring-amber-400'
          : 'bg-white hover:bg-stone-50'
      }`}
    >
      {/* Thumbnail */}
      {post.cover_image_url && (
        <div className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-0.5">
          <span>{date}</span>
          {post.location && (
            <>
              <span>·</span>
              <span className="truncate">{post.location}</span>
            </>
          )}
        </div>
        <h3 className="font-semibold text-stone-800 text-sm leading-snug line-clamp-1">
          {title}
        </h3>
        {post.body_markdown && (
          <p className="text-xs text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">
            {post.body_markdown.slice(0, 120)}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-400">
          <span>🍌 {post.banana_count}</span>
          <span>💬 {post.comment_count}</span>
        </div>
      </div>
    </button>
  )
}
