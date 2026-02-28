'use client'

import { useState } from 'react'

interface FerryParamsProps {
  boatStartKm: number
  boatKm: number
}

export default function FerryParams({ boatStartKm: initialStart, boatKm: initialBoat }: FerryParamsProps) {
  const [boatStartKm, setBoatStartKm] = useState(String(initialStart))
  const [boatKm, setBoatKm] = useState(String(initialBoat))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/ferry-params', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boatStartKm: Number(boatStartKm), boatKm: Number(boatKm) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setSuccess(`Paramètres mis à jour — ferry de ${data.boatStartKm} km à ${data.boatEndKm} km (${data.boatKm} km)`)
      setTimeout(() => setSuccess(''), 5000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm text-gray-400 mb-1">Segment ferry (trace personnalisée)</label>
      <div className="rounded-lg bg-gray-800 border border-gray-700 p-4">
        <form onSubmit={handleSave} className="space-y-3">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs text-gray-400 mb-1">Début ferry (km parcourus à vélo)</label>
              <input
                type="number"
                min={0}
                value={boatStartKm}
                onChange={e => setBoatStartKm(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs text-gray-400 mb-1">Distance ferry sur la trace (km)</label>
              <input
                type="number"
                min={0}
                value={boatKm}
                onChange={e => setBoatKm(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Fin ferry : {Number(boatStartKm) + Number(boatKm)} km
          </p>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}
        </form>
      </div>
    </div>
  )
}
