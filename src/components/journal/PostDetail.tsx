'use client'

import { useEffect, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getFingerprint } from '@/lib/utils/fingerprint'
import type { PostImage, Comment } from '@/lib/supabase/types'

interface PostDetailProps {
  postId: string
  title: string
  onBack: () => void
}

interface PostData {
  title_fr: string
  body_markdown: string
  published_at: string
  location: string | null
  day: number | null
  images: PostImage[]
  comments: Comment[]
  banana_count: number
}

export default function PostDetail({ postId, title, onBack }: PostDetailProps) {
  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [bananaCount, setBananaCount] = useState(0)
  const [hasGivenBanana, setHasGivenBanana] = useState(false)
  const [bananaAnimating, setBananaAnimating] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentAuthor, setCommentAuthor] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)

  // Fetch post details
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const commentsRes = await fetch(`/api/posts/${postId}/comments`)

        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data: postData } = await supabase
          .from('posts')
          .select('title_fr, body_markdown, published_at, location, day')
          .eq('id', postId)
          .single()

        const { data: images } = await supabase
          .from('post_images')
          .select('*')
          .eq('post_id', postId)
          .order('position')

        const { count: bCount } = await supabase
          .from('bananas')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId)

        const commentsData = commentsRes.ok ? await commentsRes.json() : []

        // Check if user already gave banana
        const fp = getFingerprint()
        const { data: existingBanana } = await supabase
          .from('bananas')
          .select('id')
          .eq('post_id', postId)
          .eq('fingerprint', fp)
          .maybeSingle()

        if (!cancelled && postData) {
          setPost({
            ...postData,
            images: images ?? [],
            comments: commentsData,
            banana_count: bCount ?? 0,
          })
          setBananaCount(bCount ?? 0)
          setComments(commentsData)
          setHasGivenBanana(!!existingBanana)
        }
      } catch (err) {
        console.error('Failed to load post:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [postId])

  // Give banana
  const handleBanana = useCallback(async () => {
    if (hasGivenBanana) return
    const fp = getFingerprint()
    setBananaAnimating(true)
    setTimeout(() => setBananaAnimating(false), 600)

    try {
      const res = await fetch(`/api/posts/${postId}/bananas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: fp }),
      })
      if (res.ok) {
        const { count } = await res.json()
        setBananaCount(count)
        setHasGivenBanana(true)
      }
    } catch (err) {
      console.error('Banana error:', err)
    }
  }, [postId, hasGivenBanana])

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentAuthor.trim() || !commentBody.trim()) return
    setSubmittingComment(true)

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: commentAuthor.trim(), body: commentBody.trim() }),
      })
      if (res.ok) {
        const newComment = await res.json()
        setComments((prev) => [...prev, newComment])
        setCommentBody('')
      }
    } catch (err) {
      console.error('Comment error:', err)
    } finally {
      setSubmittingComment(false)
    }
  }

  // Swipe handling for image carousel
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || !post) return
    const diff = touchStart - e.changedTouches[0].clientX
    const total = post.images.length
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentImage < total - 1) setCurrentImage((i) => i + 1)
      if (diff < 0 && currentImage > 0) setCurrentImage((i) => i - 1)
    }
    setTouchStart(null)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-amber-700" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="p-6 text-center text-stone-500">
        <p>Post introuvable</p>
        <button onClick={onBack} className="mt-4 text-amber-700 underline">Retour</button>
      </div>
    )
  }

  const date = new Date(post.published_at).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-stone-100">
        <button onClick={onBack} className="text-stone-500 hover:text-stone-800 transition-colors shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="font-semibold text-stone-800 truncate text-sm">{title}</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl">
          {/* Image carousel */}
          {post.images.length > 0 && (
            <div
              className="relative bg-stone-100 aspect-[4/3] sm:aspect-[16/9] overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.images[currentImage]?.url}
                alt=""
                className="h-full w-full object-cover transition-opacity duration-300"
              />
              {post.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {post.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        i === currentImage ? 'bg-white shadow' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Post content */}
          <div className="px-4 sm:px-6 py-5">
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
              <span className="capitalize">{date}</span>
              {post.location && (
                <>
                  <span>·</span>
                  <span>{post.location}</span>
                </>
              )}
              {post.day && (
                <>
                  <span>·</span>
                  <span>Jour {post.day}</span>
                </>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4">{post.title_fr}</h1>

            {post.body_markdown && (
              <div className="mb-6 text-[15px] leading-relaxed text-stone-700 [&_p]:mb-3 [&_strong]:text-stone-900 [&_a]:text-amber-700 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-stone-800 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:text-stone-800 [&_h3]:mt-4 [&_h3]:mb-1 [&_blockquote]:border-l-3 [&_blockquote]:border-amber-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-stone-500">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.body_markdown}
                </ReactMarkdown>
              </div>
            )}

            {/* Banana button */}
            <div className="flex items-center gap-4 py-3 border-y border-stone-200 mb-5">
              <button
                onClick={handleBanana}
                disabled={hasGivenBanana}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  hasGivenBanana
                    ? 'bg-amber-100 text-amber-700 cursor-default'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 active:scale-95'
                } ${bananaAnimating ? 'animate-bounce' : ''}`}
              >
                <span className="text-lg">🍌</span>
                <span>{bananaCount}</span>
              </button>
              <span className="text-sm text-stone-500">
                {hasGivenBanana ? 'Merci !' : 'Donner une banane'}
              </span>
            </div>

            {/* Comments */}
            <div>
              <h3 className="font-semibold text-stone-800 text-sm mb-3">
                Commentaires ({comments.length})
              </h3>

              {comments.length > 0 && (
                <div className="space-y-3 mb-4">
                  {comments.map((c) => (
                    <div key={c.id} className="rounded-lg bg-stone-50 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-stone-800 text-sm">{c.author}</span>
                        <span className="text-xs text-stone-400">
                          {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm text-stone-700 leading-relaxed">{c.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment form */}
              <form onSubmit={handleSubmitComment} className="space-y-2 max-w-md">
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  maxLength={50}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
                <textarea
                  placeholder="Votre message..."
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                />
                <button
                  type="submit"
                  disabled={!commentAuthor.trim() || !commentBody.trim() || submittingComment}
                  className="rounded-lg bg-amber-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:bg-stone-300 disabled:text-stone-500"
                >
                  {submittingComment ? 'Envoi...' : 'Envoyer'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
