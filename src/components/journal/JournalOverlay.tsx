'use client'

import { useState } from 'react'
import PostCard from './PostCard'
import PostDetail from './PostDetail'
import type { PostWithCounts } from '@/lib/supabase/types'

interface JournalOverlayProps {
  posts: PostWithCounts[]
  selectedPostId: string | null
  onClose: () => void
}

export default function JournalOverlay({ posts, selectedPostId, onClose }: JournalOverlayProps) {
  const [viewingPostId, setViewingPostId] = useState<string | null>(selectedPostId)

  const viewingPost = viewingPostId ? posts.find((p) => p.id === viewingPostId) : null

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col bg-white animate-slide-in-right">
      {viewingPostId && viewingPost ? (
        <PostDetail
          postId={viewingPostId}
          title={viewingPost.title_fr}
          onBack={() => setViewingPostId(null)}
        />
      ) : (
        <>
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-stone-100">
            <h2 className="font-[family-name:var(--font-lora)] text-lg font-bold text-stone-800">
              Journal de bord
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
                Aucun post pour l&apos;instant...
              </p>
            ) : (
              <div className="space-y-2">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
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
  )
}
