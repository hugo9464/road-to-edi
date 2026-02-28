'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { compressImage } from '@/lib/utils/compress-image'
import type { Post } from '@/lib/supabase/types'

// ─── GPX Section ────────────────────────────────────────────────────────────

function GpxSection() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [routeName, setRouteName] = useState<string | null>(null)

  async function handleGpx(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMsg(null)
    try {
      const formData = new FormData()
      formData.append('gpx', file)
      const res = await fetch('/api/admin/gpx-upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur upload')
      setRouteName(`${file.name.replace(/\.gpx$/i, '')} — ${data.distanceKm} km (${data.points} pts)`)
      setMsg({ type: 'ok', text: 'Trace mise à jour !' })
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erreur' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleReset() {
    setUploading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/gpx-upload', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setRouteName(null)
      setMsg({ type: 'ok', text: 'Route par défaut restaurée' })
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erreur' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mt-6 rounded-xl bg-[#16213e] p-5">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
        Trace GPX
      </h2>
      {routeName && (
        <p className="mb-3 text-xs text-green-400">{routeName}</p>
      )}
      <div className="flex gap-3 flex-wrap">
        <label className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${uploading ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}`}>
          {uploading ? 'Upload...' : 'Uploader un GPX'}
          <input ref={fileInputRef} type="file" accept=".gpx" className="hidden" onChange={handleGpx} disabled={uploading} />
        </label>
        <button
          onClick={handleReset}
          disabled={uploading}
          className="rounded-xl bg-gray-700 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-gray-600 disabled:opacity-50"
        >
          Route par défaut
        </button>
      </div>
      {msg && (
        <p className={`mt-3 rounded-lg px-4 py-2 text-sm ${msg.type === 'ok' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
          {msg.text}
        </p>
      )}
    </div>
  )
}

// ─── Story Preview Card (rendered off-screen for image capture) ─────────────

interface StoryCardProps {
  post: Post & { images?: { url: string }[] }
}

function StoryCard({ post }: StoryCardProps) {
  const coverUrl = post.cover_image_url || post.images?.[0]?.url || null
  const day = post.day ? `Jour ${post.day}` : null
  const date = new Date(post.published_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div
      style={{
        width: 360,
        height: 640,
        display: 'flex',
        flexDirection: 'column',
        background: '#1a1a2e',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Background image */}
      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.45,
          }}
          crossOrigin="anonymous"
        />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(26,26,46,0.3) 0%, rgba(26,26,46,0.7) 50%, rgba(26,26,46,0.97) 100%)',
      }} />

      {/* Top badge */}
      <div style={{
        position: 'absolute', top: 28, left: 24, right: 24,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          background: '#3b82f6', borderRadius: 50, width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>🚴</div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1 }}>
            Objectif Murrayfield
          </div>
          <div style={{ color: '#93c5fd', fontSize: 11, marginTop: 2 }}>
            Paris → Édimbourg
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '0 24px 32px',
      }}>
        {/* Day + date chip */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {day && (
            <span style={{
              background: '#3b82f6', color: '#fff', borderRadius: 20,
              padding: '4px 12px', fontSize: 12, fontWeight: 700,
            }}>{day}</span>
          )}
          {post.location && (
            <span style={{
              background: 'rgba(255,255,255,0.12)', color: '#e2e8f0',
              borderRadius: 20, padding: '4px 12px', fontSize: 12,
            }}>📍 {post.location}</span>
          )}
        </div>

        {/* Title */}
        <div style={{
          color: '#fff', fontWeight: 800, fontSize: 26,
          lineHeight: 1.2, marginBottom: 10,
        }}>
          {post.title_fr}
        </div>

        {/* Excerpt */}
        {post.body_markdown && (
          <div style={{
            color: '#94a3b8', fontSize: 13, lineHeight: 1.5,
            marginBottom: 20,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {post.body_markdown.replace(/[#*`_[\]]/g, '').slice(0, 180)}
          </div>
        )}

        {/* Date */}
        <div style={{ color: '#64748b', fontSize: 11, marginBottom: 16 }}>{date}</div>

        {/* CTA */}
        <div style={{
          background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)',
          borderRadius: 12, padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: '#93c5fd', fontSize: 12, fontWeight: 600 }}>
            Suivez l&apos;aventure 🏴󠁧󠁢󠁳󠁣󠁴󠁿
          </span>
          <span style={{ color: '#64748b', fontSize: 11 }}>
            objectif-murrayfield.fr
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Story Share Modal ───────────────────────────────────────────────────────

interface StoryShareModalProps {
  post: Post & { images?: { url: string }[] }
  onClose: () => void
}

function StoryShareModal({ post, onClose }: StoryShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [shareMsg, setShareMsg] = useState<string | null>(null)

  const generate = useCallback(async () => {
    if (!cardRef.current) return
    setGenerating(true)
    setShareMsg(null)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      })
      setImageUrl(dataUrl)
    } catch {
      setShareMsg('Erreur lors de la génération de l\'aperçu.')
    } finally {
      setGenerating(false)
    }
  }, [])

  useEffect(() => {
    generate()
  }, [generate])

  const handleShare = async () => {
    if (!imageUrl) return
    setShareMsg(null)

    try {
      // Convert data URL to Blob
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const file = new File([blob], 'story.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: post.title_fr,
        })
        setShareMsg('Partagé !')
      } else {
        // Fallback: download
        const a = document.createElement('a')
        a.href = imageUrl
        a.download = `story-${post.slug || post.id}.png`
        a.click()
        setShareMsg('Image téléchargée — ouvre Instagram et ajoute-la à ta story.')
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setShareMsg('Partage annulé ou non supporté.')
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-[#16213e] p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">Partager en Story Instagram</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>

        {/* Card preview */}
        <div className="mb-4 flex justify-center overflow-hidden rounded-xl">
          <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center', marginBottom: -128 }}>
            <div ref={cardRef}>
              <StoryCard post={post} />
            </div>
          </div>
        </div>

        {generating && (
          <p className="mb-3 text-center text-sm text-gray-400">Génération de l&apos;aperçu...</p>
        )}
        {imageUrl && !generating && (
          <div className="mb-3 flex justify-center">
            {/* Show rendered PNG preview */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Story preview"
              className="rounded-xl"
              style={{ width: 180, height: 320, objectFit: 'cover' }}
            />
          </div>
        )}

        {shareMsg && (
          <p className="mb-3 rounded-lg bg-blue-900/40 px-3 py-2 text-center text-sm text-blue-300">
            {shareMsg}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            disabled={!imageUrl || generating}
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
          >
            {generating ? 'Génération...' : '📲 Partager / Télécharger'}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-700 px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-600"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Posts List ──────────────────────────────────────────────────────────────

interface PostWithImages extends Post {
  images?: { url: string }[]
}

interface PostsListProps {
  posts: PostWithImages[]
  onEdit: (post: PostWithImages) => void
  onDelete: (id: string) => void
  onShare: (post: PostWithImages) => void
}

function PostsList({ posts, onEdit, onDelete, onShare }: PostsListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      onDelete(id)
    } catch {
      // silent
    } finally {
      setDeleting(null)
      setConfirmDelete(null)
    }
  }

  if (posts.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 py-4">Aucun post publié pour l&apos;instant.</p>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const cover = post.cover_image_url || post.images?.[0]?.url || null
        const date = new Date(post.published_at).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'short',
        })

        return (
          <div key={post.id} className="rounded-xl bg-[#1a1a2e] overflow-hidden">
            {/* Header row */}
            <div className="flex items-start gap-3 p-3">
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{post.title_fr}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {date}
                  {post.location && ` · ${post.location}`}
                  {post.day && ` · Jour ${post.day}`}
                </p>
              </div>
            </div>

            {/* Actions */}
            {confirmDelete === post.id ? (
              <div className="flex gap-2 border-t border-white/5 p-3">
                <span className="flex-1 text-xs text-red-300 flex items-center">Supprimer ce post ?</span>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deleting === post.id}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {deleting === post.id ? '...' : 'Oui'}
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs text-gray-300"
                >
                  Non
                </button>
              </div>
            ) : (
              <div className="flex gap-2 border-t border-white/5 p-3">
                <button
                  onClick={() => onEdit(post)}
                  className="flex-1 rounded-lg bg-blue-600/20 px-3 py-2 text-xs font-medium text-blue-300 hover:bg-blue-600/30 transition"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => onShare(post)}
                  className="flex-1 rounded-lg bg-purple-600/20 px-3 py-2 text-xs font-medium text-purple-300 hover:bg-purple-600/30 transition"
                >
                  📸 Story
                </button>
                <button
                  onClick={() => setConfirmDelete(post.id)}
                  className="flex-1 rounded-lg bg-red-600/20 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-600/30 transition"
                >
                  🗑️ Supprimer
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Supabase lazy init ──────────────────────────────────────────────────────

async function getSupabase(): Promise<SupabaseClient> {
  const { createClient } = await import('@/lib/supabase/client')
  return createClient()
}

// ─── Main PWA Page ───────────────────────────────────────────────────────────

export default function PWAPage() {
  // GPS state
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'watching' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [lastSent, setLastSent] = useState<Date | null>(null)
  const [sending, setSending] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  // Post form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [postLocation, setPostLocation] = useState('')
  const [postFiles, setPostFiles] = useState<File[]>([])
  const [publishing, setPublishing] = useState(false)
  const [publishMsg, setPublishMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Posts list
  const [posts, setPosts] = useState<PostWithImages[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  // Story share
  const [storyPost, setStoryPost] = useState<PostWithImages | null>(null)

  // Initialize Supabase
  useEffect(() => {
    getSupabase().then((sb) => { supabaseRef.current = sb })
  }, [])

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true)
    try {
      const res = await fetch('/api/posts?limit=20')
      if (res.ok) {
        const data = await res.json()
        setPosts(Array.isArray(data) ? data : [])
      }
    } catch {
      // silent
    } finally {
      setLoadingPosts(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // GPS tracking
  const sendPosition = useCallback(async (lat: number, lng: number, acc: number | null) => {
    if (!supabaseRef.current) {
      supabaseRef.current = await getSupabase()
    }
    setSending(true)
    try {
      const { error } = await supabaseRef.current
        .from('gps_positions')
        .insert({ lat, lng, accuracy: acc, timestamp: new Date().toISOString(), source: 'pwa' })
      if (!error) setLastSent(new Date())
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }, [])

  const forceSend = useCallback(() => {
    if (position) sendPosition(position.lat, position.lng, accuracy)
  }, [position, accuracy, sendPosition])

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('error')
      setErrorMsg('Geolocation is not supported by this browser.')
      return
    }
    setStatus('watching')
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords
        setPosition({ lat: latitude, lng: longitude })
        setAccuracy(acc)
        setStatus('watching')
      },
      (err) => { setStatus('error'); setErrorMsg(err.message) },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 },
    )
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10_000)
    return () => clearInterval(interval)
  }, [])

  const lastSentText = lastSent
    ? (() => {
        const diffMin = Math.floor((now - lastSent.getTime()) / 60_000)
        return diffMin < 1 ? 'Just now' : `${diffMin} min ago`
      })()
    : 'Never sent'

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostFiles(Array.from(e.target.files ?? []).slice(0, 5))
  }

  // Load post into edit form
  const handleEdit = (post: PostWithImages) => {
    setEditingId(post.id)
    setPostTitle(post.title_fr)
    setPostBody(post.body_markdown)
    setPostLocation(post.location ?? '')
    setPostFiles([])
    setPublishMsg(null)
    window.scrollTo({ top: document.getElementById('post-form')?.offsetTop ?? 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setPostTitle('')
    setPostBody('')
    setPostLocation('')
    setPostFiles([])
    setPublishMsg(null)
  }

  // Create or update post
  const handlePublish = async () => {
    if (!postTitle.trim()) return
    setPublishing(true)
    setPublishMsg(null)

    try {
      let post: PostWithImages

      if (editingId) {
        // UPDATE existing post
        const res = await fetch(`/api/posts/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title_fr: postTitle.trim(),
            body_markdown: postBody.trim(),
            location: postLocation.trim() || null,
            lat: position?.lat ?? null,
            lng: position?.lng ?? null,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Erreur lors de la mise à jour')
        }
        post = await res.json()
      } else {
        // CREATE new post
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title_fr: postTitle.trim(),
            body_markdown: postBody.trim(),
            lat: position?.lat ?? null,
            lng: position?.lng ?? null,
            location: postLocation.trim() || null,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to create post')
        }
        post = await res.json()
      }

      // Upload new images if any
      if (postFiles.length > 0) {
        const formData = new FormData()
        for (const file of postFiles) {
          const compressed = await compressImage(file)
          formData.append('files', compressed, file.name.replace(/\.[^.]+$/, '.jpg'))
        }
        await fetch(`/api/posts/${post.id}/images`, { method: 'POST', body: formData })
      }

      setPublishMsg({ type: 'ok', text: editingId ? 'Post mis à jour !' : 'Post publié !' })
      cancelEdit()
      await fetchPosts()
    } catch (err) {
      setPublishMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erreur' })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#1a1a2e] p-6 text-white">
      <h1 className="mb-6 text-center text-xl font-bold">Objectif Murrayfield - GPS Tracker</h1>

      {/* GPS status */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <span className={`inline-block h-3 w-3 rounded-full ${
          status === 'watching' ? 'animate-pulse bg-green-400'
            : status === 'error' ? 'bg-red-400' : 'bg-gray-500'
        }`} />
        <span className="text-sm text-gray-300">
          {status === 'watching' ? 'Tracking active' : status === 'error' ? 'Error' : 'Initializing...'}
        </span>
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg bg-red-900/40 px-4 py-2 text-center text-sm text-red-300">
          {errorMsg}
        </p>
      )}

      {/* Position card */}
      <div className="mb-6 rounded-xl bg-[#16213e] p-5">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-400">Current Position</h2>
        {position ? (
          <div className="space-y-2 font-mono text-sm">
            <p><span className="text-gray-400">Lat: </span><span>{position.lat.toFixed(6)}</span></p>
            <p><span className="text-gray-400">Lng: </span><span>{position.lng.toFixed(6)}</span></p>
            {accuracy !== null && (
              <p><span className="text-gray-400">Accuracy: </span><span>{Math.round(accuracy)} m</span></p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Waiting for GPS signal...</p>
        )}
      </div>

      {/* Last sent */}
      <div className="mb-6 rounded-xl bg-[#16213e] p-5">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-400">Last Sent</h2>
        <p className={`text-lg font-semibold ${lastSent ? 'text-green-400' : 'text-gray-500'}`}>
          {lastSentText}
        </p>
        {lastSent && <p className="mt-1 text-xs text-gray-500">{lastSent.toLocaleTimeString()}</p>}
      </div>

      <button
        onClick={forceSend}
        disabled={!position || sending}
        className="rounded-xl bg-blue-600 px-6 py-4 text-center font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-700 disabled:text-gray-500"
      >
        {sending ? 'Sending...' : 'Force send now'}
      </button>

      {/* ── Post form ── */}
      <div id="post-form" className="mt-8 rounded-xl bg-[#16213e] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">
            {editingId ? 'Modifier le post' : 'Nouveau post'}
          </h2>
          {editingId && (
            <button onClick={cancelEdit} className="text-xs text-gray-500 hover:text-gray-300">
              Annuler
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Titre *"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          className="mb-3 w-full rounded-lg bg-[#1a1a2e] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Corps du post (markdown)"
          value={postBody}
          onChange={(e) => setPostBody(e.target.value)}
          rows={4}
          className="mb-3 w-full resize-none rounded-lg bg-[#1a1a2e] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Lieu (optionnel)"
          value={postLocation}
          onChange={(e) => setPostLocation(e.target.value)}
          className="mb-3 w-full rounded-lg bg-[#1a1a2e] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {position && (
          <p className="mb-3 text-xs text-gray-500">
            GPS: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
        )}

        <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-lg bg-[#1a1a2e] px-4 py-3 text-sm text-gray-400 hover:text-white transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          {postFiles.length > 0 ? `${postFiles.length} photo(s) sélectionnée(s)` : 'Ajouter des photos (max 5)'}
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        </label>

        {postFiles.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
            {postFiles.map((f, i) => (
              <div key={i} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {publishMsg && (
          <p className={`mb-3 rounded-lg px-4 py-2 text-center text-sm ${
            publishMsg.type === 'ok' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'
          }`}>
            {publishMsg.text}
          </p>
        )}

        <button
          onClick={handlePublish}
          disabled={!postTitle.trim() || publishing}
          className="w-full rounded-xl bg-orange-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-orange-700 active:bg-orange-800 disabled:bg-gray-700 disabled:text-gray-500"
        >
          {publishing ? 'Publication...' : editingId ? 'Mettre à jour' : 'Publier'}
        </button>
      </div>

      {/* ── Posts list ── */}
      <div className="mt-6 rounded-xl bg-[#16213e] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">Posts récents</h2>
          <button
            onClick={fetchPosts}
            disabled={loadingPosts}
            className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
          >
            {loadingPosts ? 'Chargement...' : '↻ Actualiser'}
          </button>
        </div>
        {loadingPosts && posts.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-4">Chargement...</p>
        ) : (
          <PostsList
            posts={posts}
            onEdit={handleEdit}
            onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
            onShare={(post) => setStoryPost(post)}
          />
        )}
      </div>

      <GpxSection />

      {/* Story share modal */}
      {storyPost && (
        <StoryShareModal post={storyPost} onClose={() => setStoryPost(null)} />
      )}
    </div>
  )
}
