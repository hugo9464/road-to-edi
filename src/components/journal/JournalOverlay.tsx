'use client'

import { useState } from 'react'
import PostCard from './PostCard'
import PostDetail from './PostDetail'
import type { PostWithCounts } from '@/lib/supabase/types'
import { useLanguage } from '@/contexts/LanguageContext'

interface JournalOverlayProps {
  posts: PostWithCounts[]
  selectedPostId: string | null
  onClose: () => void
}

export default function JournalOverlay({ posts, selectedPostId, onClose }: JournalOverlayProps) {
  const [viewingPostId, setViewingPostId] = useState<string | null>(selectedPostId)
  const { lang } = useLanguage()

  const viewingPost = viewingPostId ? posts.find((p) => p.id === viewingPostId) : null

  return (
    <div className="fixed inset-0 z-[2000] flex items-stretch justify-end bg-black/30 sm:p-4 sm:justify-center sm:items-center">
      <div className="flex flex-col w-full sm:max-w-xl sm:max-h-[90vh] bg-white sm:rounded-2xl sm:shadow-2xl animate-slide-in-right overflow-hidden">
        {viewingPostId && viewingPost ? (
          <PostDetail
            postId={viewingPostId}
            title={lang === 'en' && viewingPost.title_en ? viewingPost.title_en : viewingPost.title_fr}
            lang={lang}
            onBack={() => setViewingPostId(null)}
            onClose={onClose}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-stone-100 shrink-0">
              <h2 className="font-[family-name:var(--font-lora)] text-lg font-bold text-stone-800">
                {lang === 'en' ? 'Logbook' : 'Journal de bord'}
              </h2>
              <button
                onClick={onClose}
                className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-stone-100 transition-colors text-stone-500"
                aria-label="Fermer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Posts list */}
            <div className="flex-1 overflow-y-auto p-4">
              {posts.length === 0 ? (
                <p className="text-center text-stone-400 text-sm py-12">
                  {lang === 'en' ? 'No posts yet...' : 'Aucun post pour l\'instant...'}
                </p>
              ) : (
                <div className="space-y-2">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      lang={lang}
                      onClick={() => setViewingPostId(post.id)}
                      highlighted={post.id === selectedPostId}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
