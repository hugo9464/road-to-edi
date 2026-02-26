'use client'

import { useState } from 'react'

export default function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
      } else if (data.message?.includes('Déjà')) {
        setStatus('already')
      } else {
        setStatus('success')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="border-t border-stone-200 pt-4 mt-4 px-1">
        <p className="text-sm text-amber-700 font-medium">
          Un email de confirmation vient d&apos;être envoyé ! Vérifie ta boîte mail.
        </p>
      </div>
    )
  }

  if (status === 'already') {
    return (
      <div className="border-t border-stone-200 pt-4 mt-4 px-1">
        <p className="text-sm text-stone-500">Tu es déjà inscrit(e) !</p>
      </div>
    )
  }

  return (
    <div className="border-t border-stone-200 pt-4 mt-4 px-1">
      <p className="text-sm text-stone-500 mb-2">
        Reçois les prochains posts par email
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ton@email.com"
          required
          className="flex-1 min-w-0 px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 text-sm font-medium text-white bg-amber-700 rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 shrink-0"
        >
          {status === 'loading' ? '...' : 'Suivre'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-sm text-red-600 mt-1">Une erreur est survenue, réessaie.</p>
      )}
    </div>
  )
}
