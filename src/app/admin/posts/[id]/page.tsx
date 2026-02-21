'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Post } from '@/lib/supabase/types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [titleFr, setTitleFr] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [slug, setSlug] = useState('')
  const [day, setDay] = useState('')
  const [location, setLocation] = useState('')
  const [publishedAt, setPublishedAt] = useState('')
  const [bodyMarkdown, setBodyMarkdown] = useState('')
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/admin/posts/${id}`)
        if (!res.ok) throw new Error('Erreur chargement')
        const { post }: { post: Post } = await res.json()

        setTitleFr(post.title_fr)
        setTitleEn(post.title_en || '')
        setSlug(post.slug)
        setDay(post.day != null ? String(post.day) : '')
        setLocation(post.location || '')
        setPublishedAt(
          post.published_at
            ? new Date(post.published_at).toISOString().slice(0, 16)
            : ''
        )
        setBodyMarkdown(post.body_markdown)
        setExistingImageUrl(post.cover_image_url)
      } catch {
        setError('Impossible de charger l\'article')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      let coverImageUrl = existingImageUrl

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

      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'PATCH',
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
        throw new Error(data.error || 'Erreur mise a jour')
      }

      router.push('/admin/posts')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cet article ?')) return

    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur suppression')
      router.push('/admin/posts')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  if (loading) {
    return <p className="text-gray-400">Chargement...</p>
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Modifier l&apos;article</h2>
        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-lg bg-red-900/50 text-sm text-red-300 hover:bg-red-900 transition-colors min-h-[44px]"
        >
          Supprimer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title_fr" className="block text-sm text-gray-400 mb-1">
            Titre (FR) *
          </label>
          <input
            id="title_fr"
            type="text"
            value={titleFr}
            onChange={(e) => setTitleFr(e.target.value)}
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
          {(imagePreview || existingImageUrl) && (
            <img
              src={imagePreview || existingImageUrl!}
              alt="Preview"
              className="mb-3 rounded-lg max-h-48 object-cover"
            />
          )}
          <input
            id="cover_image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white file:cursor-pointer hover:file:bg-gray-600"
          />
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
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
