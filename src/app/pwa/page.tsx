'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

// Lazily import to avoid SSR initialization
async function getSupabase(): Promise<SupabaseClient> {
  const { createClient } = await import('@/lib/supabase/client')
  return createClient()
}

const SEND_INTERVAL = 5 * 60 * 1000 // 5 minutes

export default function PWAPage() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'watching' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [lastSent, setLastSent] = useState<Date | null>(null)
  const [sending, setSending] = useState(false)
  const lastSentRef = useRef<number>(0)
  const watchIdRef = useRef<number | null>(null)
  const supabaseRef = useRef<SupabaseClient | null>(null)

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

      const now = Date.now()
      lastSentRef.current = now
      setLastSent(new Date(now))
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

        // Debounce: send every 5 minutes
        const now = Date.now()
        if (now - lastSentRef.current >= SEND_INTERVAL) {
          sendPosition(latitude, longitude, acc)
        }
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
  }, [sendPosition])

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

  return (
    <div className="flex min-h-dvh flex-col bg-[#1a1a2e] p-6 text-white">
      <h1 className="mb-6 text-center text-xl font-bold">Road to Edi - GPS Tracker</h1>

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
        className="mt-auto rounded-xl bg-blue-600 px-6 py-4 text-center font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-700 disabled:text-gray-500"
      >
        {sending ? 'Sending...' : 'Force send now'}
      </button>
    </div>
  )
}
