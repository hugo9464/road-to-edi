'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function NewPostPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [titleFr, setTitleFr] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [slug, setSlug] = useState('')
  const [day, setDay] = useState('')
  const [location, setLocation] = useState('')
  const [publishedAt, setPublishedAt] = useState('')
  const [bodyMarkdown, setBodyMarkdown] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  function handleTitleChange(value: string) {
    setTitleFr(value)
    setSlug(slugify(value))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    } else {
      setImagePreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      let coverImageUrl: string | null = null

      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const uploadRes = await fetch('/api/admin/posts/upload', {
          method: 'POST',
          body: formData,
        })
        if (!uploadRes.ok) throw new Error('Erreur upload image')
        const uploadData = await uploadRes.json()
        coverImageUrl = uploadData.url
      }

      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_fr: titleFr,
          title_en: titleEn || null,
          slug,
          day: day ? parseInt(day, 10) : null,
          location: location || null,
          published_at: publishedAt || new Date().toISOString(),
          cover_image_url: coverImageUrl,
          body_markdown: bodyMarkdown,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur creation')
      }

      router.push('/admin/posts')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <h2 className="text-2xl font-bold mb-6">Nouvel article</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title_fr" className="block text-sm text-gray-400 mb-1">
            Titre (FR) *
          </label>
          <input
            id="title_fr"
            type="text"
            value={titleFr}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="title_en" className="block text-sm text-gray-400 mb-1">
            Titre (EN)
          </label>
          <input
            id="title_en"
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm text-gray-400 mb-1">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="day" className="block text-sm text-gray-400 mb-1">
              Jour
            </label>
            <input
              id="day"
              type="number"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm text-gray-400 mb-1">
              Lieu
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="published_at" className="block text-sm text-gray-400 mb-1">
            Date de publication
          </label>
          <input
            id="published_at"
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="cover_image" className="block text-sm text-gray-400 mb-1">
            Image de couverture
          </label>
          <input
            id="cover_image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white file:cursor-pointer hover:file:bg-gray-600"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-3 rounded-lg max-h-48 object-cover"
            />
          )}
        </div>

        <div>
          <label htmlFor="body_markdown" className="block text-sm text-gray-400 mb-1">
            Contenu &mdash; Markdown: **gras**, *italique*, ## titre
          </label>
          <textarea
            id="body_markdown"
            value={bodyMarkdown}
            onChange={(e) => setBodyMarkdown(e.target.value)}
            rows={15}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 border-t border-gray-800 md:static md:bg-transparent md:border-0 md:p-0">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Enregistrement...' : 'Publier'}
          </button>
        </div>
      </form>
    </div>
  )
}
