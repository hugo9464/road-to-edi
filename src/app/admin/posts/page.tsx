import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Post } from '@/lib/supabase/types'

export default async function AdminPostsPage() {
  const authed = await isAdminAuthenticated()
  if (!authed) redirect('/admin/login')

  const supabase = createAdminClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title_fr, day, location, published_at, slug')
    .order('published_at', { ascending: false })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Articles</h2>

      <div className="space-y-3">
        {posts && posts.length > 0 ? (
          posts.map((post: Pick<Post, 'id' | 'title_fr' | 'day' | 'location' | 'published_at' | 'slug'>) => (
            <div
              key={post.id}
              className="bg-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {post.day != null ? `Jour ${post.day} — ` : ''}
                  {post.title_fr}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {post.location && <span>{post.location} &middot; </span>}
                  {new Date(post.published_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  href={`/admin/posts/${post.id}`}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-sm text-white hover:bg-gray-600 transition-colors min-h-[44px] flex items-center"
                >
                  Modifier
                </a>
                <form action={`/api/admin/posts/${post.id}/delete`} method="POST">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-red-900/50 text-sm text-red-300 hover:bg-red-900 transition-colors min-h-[44px]"
                  >
                    Supprimer
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Aucun article pour le moment.</p>
        )}
      </div>

      <a
        href="/admin/posts/new"
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition-colors"
        aria-label="Nouvel article"
      >
        +
      </a>
    </div>
  )
}
