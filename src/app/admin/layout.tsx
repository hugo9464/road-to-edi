export const metadata = {
  title: 'Admin — Objectif Murrayfield',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex">
      <aside className="w-64 bg-gray-950 border-r border-gray-800 p-6 flex flex-col max-md:hidden">
        <h1 className="text-lg font-bold mb-8 text-white">
          Objectif Murrayfield Admin
        </h1>
        <nav className="flex flex-col gap-2 flex-1">
          <a
            href="/admin/settings"
            className="px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Parametres
          </a>
          <a
            href="/"
            className="px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Voir le site
          </a>
        </nav>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-lg text-left text-red-400 hover:bg-gray-800 transition-colors"
          >
            Deconnexion
          </button>
        </form>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-gray-950 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white">
            Objectif Murrayfield Admin
          </h1>
          <nav className="flex items-center gap-3">
            <a href="/admin/settings" className="text-sm text-gray-300 hover:text-white">
              Parametres
            </a>
            <form action="/api/admin/logout" method="POST" className="inline">
              <button type="submit" className="text-sm text-red-400 hover:text-red-300">
                Deconnexion
              </button>
            </form>
          </nav>
        </header>
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
