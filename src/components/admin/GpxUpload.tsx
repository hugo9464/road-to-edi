'use client'

import { useRef, useState } from 'react'

interface RouteInfo {
  name: string
  totalKm: number
  points?: number
}

interface GpxUploadProps {
  currentRoute: RouteInfo | null
}

export default function GpxUpload({ currentRoute }: GpxUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [localRoute, setLocalRoute] = useState<RouteInfo | null>(currentRoute)
  const [isRemaining, setIsRemaining] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('gpx', file)
      if (isRemaining) formData.append('remaining', 'true')

      const res = await fetch('/api/admin/gpx-upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur upload')
      }

      setLocalRoute({
        name: file.name.replace(/\.gpx$/i, ''),
        totalKm: data.distanceKm,
        points: data.points,
      })
      setSuccess(`Trace mise à jour (${data.points} points, ${data.distanceKm} km)`)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleReset() {
    if (!confirm('Réinitialiser la trace vers la route par défaut ?')) return

    setResetting(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/gpx-upload', { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur réinitialisation')
      }

      setLocalRoute(null)
      setSuccess('Trace réinitialisée vers la route par défaut')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm text-gray-400 mb-1">
        Trace prévue (GPX)
      </label>

      <div className="rounded-lg bg-gray-800 border border-gray-700 p-4 space-y-3">
        {localRoute ? (
          <div className="text-sm">
            <p className="text-white font-medium">{localRoute.name}</p>
            <p className="text-gray-400">{localRoute.totalKm} km{localRoute.points ? ` · ${localRoute.points} points` : ''}</p>
            <p className="text-blue-400 text-xs mt-1">Trace personnalisée</p>
          </div>
        ) : (
          <div className="text-sm">
            <p className="text-gray-400">Route par défaut (Cergy → Édimbourg)</p>
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isRemaining}
            onChange={(e) => setIsRemaining(e.target.checked)}
            className="w-4 h-4 rounded accent-blue-500"
          />
          <span className="text-sm text-gray-300">
            Trace partielle (depuis la dernière position GPS)
          </span>
        </label>

        {isRemaining && (
          <p className="text-xs text-yellow-400">
            La portion déjà parcourue sera conservée depuis la route actuelle jusqu&apos;à la dernière position GPS connue.
          </p>
        )}

        <div className="flex gap-3 flex-wrap">
          <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
            {uploading ? 'Upload en cours...' : 'Uploader un GPX'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".gpx"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>

          {localRoute && (
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resetting ? 'Réinitialisation...' : 'Route par défaut'}
            </button>
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}
      </div>
    </div>
  )
}
