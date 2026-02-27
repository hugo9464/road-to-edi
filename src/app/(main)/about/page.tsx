const stages = [
  { from: 'Paris', to: 'Dieppe', km: 200 },
  { from: 'Dieppe', to: 'Newhaven', km: 115, note: 'Ferry' },
  { from: 'Newhaven', to: 'London', km: 100 },
  { from: 'London', to: 'Cambridge', km: 100 },
  { from: 'Cambridge', to: 'York', km: 250 },
  { from: 'York', to: 'Newcastle', km: 135 },
  { from: 'Newcastle', to: 'Edinburgh', km: 200 },
]

export default function AboutPage() {
  const totalKm = 1046

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Objectif Murrayfield</h1>
        <p className="text-lg text-gray-600">
          Paris &rarr; Edinburgh à vélo &mdash; {totalKm} km pour la bonne cause
        </p>
      </section>

      {/* About Hugo */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">À propos de Hugo</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            Hugo est un cycliste passionné qui se lance dans un voyage ambitieux de Paris à Édimbourg.
            Sur environ {totalKm} km répartis en plusieurs étapes, cette aventure combine sa passion
            du vélo avec une cause qui lui tient à cœur : récolter des fonds pour l&apos;association
            «&nbsp;Le Souci des Nôtres&nbsp;».
          </p>
          <p>
            La destination finale ? Le stade de Murrayfield à Édimbourg, pour assister au match
            Écosse-France du Tournoi des Six Nations. Mais le voyage en lui-même est la vraie
            aventure &mdash; pédaler à travers la France, traverser la Manche, et remonter
            l&apos;Angleterre jusqu&apos;en Écosse.
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="mb-12 rounded-xl bg-blue-50 p-6">
        <h2 className="mb-3 text-xl font-semibold text-blue-900">Pourquoi ?</h2>
        <p className="text-blue-800">
          Pour voir le match Écosse-France à Murrayfield et soutenir l&apos;association
          «&nbsp;Le Souci des Nôtres&nbsp;» &mdash; une association dédiée à l&apos;aide
          aux plus démunis. Chaque kilomètre compte, sur la route comme en dons récoltés.
        </p>
      </section>

      {/* Route overview */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">L&apos;itinéraire</h2>
        <p className="mb-6 text-gray-600">
          Distance totale estimée : <strong className="text-foreground">{totalKm} km</strong> en 7 étapes
        </p>

        <div className="space-y-3">
          {stages.map((stage, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="font-medium">
                  {stage.from} &rarr; {stage.to}
                </span>
                {stage.note && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {stage.note}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">{stage.km} km</span>
            </div>
          ))}
        </div>
      </section>

      {/* Links */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Suivre l&apos;aventure</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://www.instagram.com/hugo_a_velo/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-3 font-medium transition hover:bg-gray-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            Instagram
          </a>
        </div>
      </section>
    </main>
  )
}
