import { getAllPosts } from '@/lib/supabase/queries'
import PostCard from '@/components/blog/PostCard'

export const dynamic = 'force-dynamic'

interface BlogPageProps {
  params: Promise<{ locale: string }>
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params
  const posts = await getAllPosts()

  const title = locale === 'en' ? 'Travel Blog' : 'Journal de bord'
  const subtitle = locale === 'en'
    ? 'Follow the journey day by day'
    : 'Suivez l\'aventure jour après jour'

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-lg text-gray-500">{subtitle}</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-5xl mb-4">📝</div>
          <p>{locale === 'en' ? 'No posts yet. Check back soon!' : 'Aucun article pour le moment. Revenez bientôt !'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      )}
    </main>
  )
}
