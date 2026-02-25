const stages = [
  { from: 'Paris', to: 'Calais', km: 290 },
  { from: 'Calais', to: 'Dover', km: 50, note: 'Ferry' },
  { from: 'Dover', to: 'London', km: 125 },
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
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Paris &rarr; Edinburgh by bike &mdash; {totalKm} km for a cause
        </p>
      </section>

      {/* About Hugo */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">About Hugo</h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            Hugo is a passionate cyclist embarking on an ambitious journey from Paris to Edinburgh.
            Covering approximately {totalKm} km over several stages, this adventure combines his love
            for cycling with a meaningful cause: raising funds for the association
            &ldquo;Le Souci des N&ocirc;tres&rdquo;.
          </p>
          <p>
            The final destination? Murrayfield Stadium in Edinburgh, to watch the Scotland vs France
            rugby match in the Six Nations tournament. But the journey itself is the real story &mdash;
            pedaling through France, crossing the Channel, and riding up through England and into Scotland.
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="mb-12 rounded-xl bg-blue-50 p-6 dark:bg-blue-950/30">
        <h2 className="mb-3 text-xl font-semibold text-blue-900 dark:text-blue-200">Why?</h2>
        <p className="text-blue-800 dark:text-blue-300">
          Pour voir le match &Eacute;cosse-France &agrave; Murrayfield et soutenir l&apos;association
          &ldquo;Le Souci des N&ocirc;tres&rdquo; &mdash; a charity dedicated to supporting those in need.
          Every kilometer counts, both on the road and in donations raised.
        </p>
      </section>

      {/* Route overview */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">Route Overview</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Estimated total distance: <strong className="text-foreground">{totalKm} km</strong> across 7 stages
        </p>

        <div className="space-y-3">
          {stages.map((stage, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="font-medium">
                  {stage.from} &rarr; {stage.to}
                </span>
                {stage.note && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {stage.note}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{stage.km} km</span>
            </div>
          ))}
        </div>
      </section>

      {/* Links */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Follow the Journey</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-3 font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            Instagram
          </a>
          <a
            href="https://strava.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-3 font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Strava
          </a>
        </div>
      </section>
    </main>
  )
}
