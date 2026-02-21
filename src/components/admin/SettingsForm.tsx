'use client'

import { useState } from 'react'
import type { SiteSettings } from '@/lib/supabase/types'

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [journeyStartDate, setJourneyStartDate] = useState(settings.journey_start_date || '')
  const [totalDistanceKm, setTotalDistanceKm] = useState(String(settings.total_distance_km))
  const [instagramHandle, setInstagramHandle] = useState(settings.instagram_handle)
  const [donationUrl, setDonationUrl] = useState(settings.donation_url)
  const [fundraisingGoal, setFundraisingGoal] = useState(String(settings.fundraising_goal))
  const [fundraisingCurrent, setFundraisingCurrent] = useState(String(settings.fundraising_current))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journey_start_date: journeyStartDate || null,
          total_distance_km: parseFloat(totalDistanceKm) || 0,
          instagram_handle: instagramHandle,
          donation_url: donationUrl,
          fundraising_goal: parseFloat(fundraisingGoal) || 0,
          fundraising_current: parseFloat(fundraisingCurrent) || 0,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur sauvegarde')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="journey_start_date" className="block text-sm text-gray-400 mb-1">
          Date de depart
        </label>
        <input
          id="journey_start_date"
          type="date"
          value={journeyStartDate}
          onChange={(e) => setJourneyStartDate(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="total_distance_km" className="block text-sm text-gray-400 mb-1">
          Distance totale (km)
        </label>
        <input
          id="total_distance_km"
          type="number"
          step="0.1"
          value={totalDistanceKm}
          onChange={(e) => setTotalDistanceKm(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="instagram_handle" className="block text-sm text-gray-400 mb-1">
          Instagram
        </label>
        <input
          id="instagram_handle"
          type="text"
          value={instagramHandle}
          onChange={(e) => setInstagramHandle(e.target.value)}
          placeholder="@handle"
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="donation_url" className="block text-sm text-gray-400 mb-1">
          URL de donation
        </label>
        <input
          id="donation_url"
          type="url"
          value={donationUrl}
          onChange={(e) => setDonationUrl(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fundraising_goal" className="block text-sm text-gray-400 mb-1">
            Objectif collecte
          </label>
          <input
            id="fundraising_goal"
            type="number"
            step="1"
            value={fundraisingGoal}
            onChange={(e) => setFundraisingGoal(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="fundraising_current" className="block text-sm text-gray-400 mb-1">
            Collecte actuelle
          </label>
          <input
            id="fundraising_current"
            type="number"
            step="1"
            value={fundraisingCurrent}
            onChange={(e) => setFundraisingCurrent(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {success && (
        <p className="text-green-400 text-sm">Parametres enregistres</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  )
}
