import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import { getAllPosts, getPostBySlug } from '@/lib/supabase/queries'
import MarkdownRenderer from '@/components/blog/MarkdownRenderer'

interface PostPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts()
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Article introuvable' }

  const title = (locale === 'en' && post.title_en) ? post.title_en : post.title_fr
  const desc = post.body_markdown.replace(/#{1,6}\s|[*_`]/g, '').slice(0, 160)

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      ...(post.cover_image_url ? { images: [{ url: post.cover_image_url }] } : {}),
    },
  }
}

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function PostPage({ params }: PostPageProps) {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-400">
          {locale === 'en' ? 'Post not found.' : 'Article introuvable.'}
        </p>
      </main>
    )
  }

  const title = (locale === 'en' && post.title_en) ? post.title_en : post.title_fr

  return (
    <main className="pb-16">
      {post.cover_image_url && (
        <div className="relative h-64 w-full sm:h-80 md:h-96">
          <Image
            src={post.cover_image_url}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 pt-8 sm:px-6">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          ← {locale === 'en' ? 'Back to blog' : 'Retour au journal'}
        </Link>

        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {post.day != null && (
              <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                Jour {post.day}
              </span>
            )}
            {post.location && (
              <span className="text-sm text-gray-500">📍 {post.location}</span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h1>
          <time className="mt-2 block text-sm text-gray-400">
            {formatDate(post.published_at, locale)}
          </time>
        </header>

        <MarkdownRenderer content={post.body_markdown} />
      </article>
    </main>
  )
}
