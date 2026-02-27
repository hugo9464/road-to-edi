'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { compressImage } from '@/lib/utils/compress-image'

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

// Lazily import to avoid SSR initialization
async function getSupabase(): Promise<SupabaseClient> {
  const { createClient } = await import('@/lib/supabase/client')
  return createClient()
}

export default function PWAPage() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'watching' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [lastSent, setLastSent] = useState<Date | null>(null)
  const [sending, setSending] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  // Post form state
  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [postLocation, setPostLocation] = useState('')
  const [postFiles, setPostFiles] = useState<File[]>([])
  const [publishing, setPublishing] = useState(false)
  const [publishMsg, setPublishMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Initialize Supabase lazily
  useEffect(() => {
    getSupabase().then((sb) => {
      supabaseRef.current = sb
    })
  }, [])

  const sendPosition = useCallback(async (lat: number, lng: number, acc: number | null) => {
    if (!supabaseRef.current) {
      supabaseRef.current = await getSupabase()
    }
    setSending(true)
    try {
      const { error } = await supabaseRef.current
        .from('gps_positions')
        .insert({
          lat,
          lng,
          accuracy: acc,
          timestamp: new Date().toISOString(),
          source: 'pwa',
        })

      if (error) {
        console.error('Supabase insert error:', error)
        return
      }

      setLastSent(new Date())
    } catch (err) {
      console.error('Failed to send position:', err)
    } finally {
      setSending(false)
    }
  }, [])

  const forceSend = useCallback(() => {
    if (position) {
      sendPosition(position.lat, position.lng, accuracy)
    }
  }, [position, accuracy, sendPosition])

  // Start watching position on mount
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
      (err) => {
        setStatus('error')
        setErrorMsg(err.message)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 30000,
      },
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  // "Last sent X min ago" display
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10_000)
    return () => clearInterval(interval)
  }, [])

  const lastSentText = lastSent
    ? (() => {
        const diffMin = Math.floor((now - lastSent.getTime()) / 60_000)
        if (diffMin < 1) return 'Just now'
        return `${diffMin} min ago`
      })()
    : 'Never sent'

  // Handle file selection (max 5)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5)
    setPostFiles(files)
  }

  // Publish post
  const handlePublish = async () => {
    if (!postTitle.trim()) return
    setPublishing(true)
    setPublishMsg(null)

    try {
      // 1. Create post
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

      const post = await res.json()

      // 2. Upload images if any
      if (postFiles.length > 0) {
        const formData = new FormData()
        for (const file of postFiles) {
          const compressed = await compressImage(file)
          formData.append('files', compressed, file.name.replace(/\.[^.]+$/, '.jpg'))
        }
        const imgRes = await fetch(`/api/posts/${post.id}/images`, {
          method: 'POST',
          body: formData,
        })
        if (!imgRes.ok) {
          const err = await imgRes.json()
          console.error('Image upload failed:', err.error)
        }
      }

      setPublishMsg({ type: 'ok', text: 'Post published!' })
      setPostTitle('')
      setPostBody('')
      setPostLocation('')
      setPostFiles([])
    } catch (err) {
      setPublishMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#1a1a2e] p-6 text-white">
      <h1 className="mb-6 text-center text-xl font-bold">Objectif Murrayfield - GPS Tracker</h1>

      {/* Status indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <span
          className={`inline-block h-3 w-3 rounded-full ${
            status === 'watching'
              ? 'animate-pulse bg-green-400'
              : status === 'error'
                ? 'bg-red-400'
                : 'bg-gray-500'
          }`}
        />
        <span className="text-sm text-gray-300">
          {status === 'watching'
            ? 'Tracking active'
            : status === 'error'
              ? 'Error'
              : 'Initializing...'}
        </span>
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg bg-red-900/40 px-4 py-2 text-center text-sm text-red-300">
          {errorMsg}
        </p>
      )}

      {/* Position card */}
      <div className="mb-6 rounded-xl bg-[#16213e] p-5">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-400">
          Current Position
        </h2>
        {position ? (
          <div className="space-y-2 font-mono text-sm">
            <p>
              <span className="text-gray-400">Lat: </span>
              <span className="text-white">{position.lat.toFixed(6)}</span>
            </p>
            <p>
              <span className="text-gray-400">Lng: </span>
              <span className="text-white">{position.lng.toFixed(6)}</span>
            </p>
            {accuracy !== null && (
              <p>
                <span className="text-gray-400">Accuracy: </span>
                <span className="text-white">{Math.round(accuracy)} m</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Waiting for GPS signal...</p>
        )}
      </div>

      {/* Last sent */}
      <div className="mb-6 rounded-xl bg-[#16213e] p-5">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-400">
          Last Sent
        </h2>
        <p className={`text-lg font-semibold ${lastSent ? 'text-green-400' : 'text-gray-500'}`}>
          {lastSentText}
        </p>
        {lastSent && (
          <p className="mt-1 text-xs text-gray-500">
            {lastSent.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Force send button */}
      <button
        onClick={forceSend}
        disabled={!position || sending}
        className="rounded-xl bg-blue-600 px-6 py-4 text-center font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-700 disabled:text-gray-500"
      >
        {sending ? 'Sending...' : 'Force send now'}
      </button>

      {/* ── New Post section ── */}
      <div className="mt-8 rounded-xl bg-[#16213e] p-5">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
          Nouveau post
        </h2>

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
          className="mb-3 w-full rounded-lg bg-[#1a1a2e] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
          {postFiles.length > 0 ? `${postFiles.length} photo(s)` : 'Ajouter des photos (max 5)'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {postFiles.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
            {postFiles.map((f, i) => (
              <div key={i} className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(f)}
                  alt={f.name}
                  className="h-full w-full object-cover"
                />
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
          {publishing ? 'Publication...' : 'Publier'}
        </button>
      </div>

      <GpxSection />
    </div>
  )
}
