import { getSiteSettings } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

export default async function FundraisingPage() {
  const settings = await getSiteSettings()

  const goal = settings?.fundraising_goal ?? 5000
  const current = settings?.fundraising_current ?? 0
  const donationUrl = settings?.donation_url || 'https://www.helloasso.com/associations/le-souci-des-notres/formulaires/1'
  const pct = Math.min(100, Math.round((current / goal) * 100))

  const fmt = (n: number) => n.toLocaleString('fr-FR')

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Soutenir la cause</h1>
        <p className="text-lg text-gray-500">
          Chaque don, même petit, fait une vraie différence.
        </p>
      </section>

      <section className="mb-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8">
        <h2 className="mb-3 text-2xl font-semibold">Le souci des nôtres</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            «&nbsp;Le souci des nôtres&nbsp;» est une association de solidarité qui apporte
            un soutien direct aux personnes en difficulté dans nos communautés.
          </p>
          <p>
            Ce voyage Paris–Édimbourg est une façon de donner de la visibilité à leur mission
            et de récolter des fonds pour leurs actions concrètes sur le terrain.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-center">Progression</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-center">
            <span className="text-4xl font-bold text-blue-600">{fmt(current)}&nbsp;€</span>
            <span className="text-lg text-gray-400"> / {fmt(goal)}&nbsp;€</span>
          </div>
          <div className="h-6 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2 transition-all duration-700"
              style={{ width: `${Math.max(pct, current > 0 ? 2 : 0)}%` }}
            >
              {pct >= 10 && (
                <span className="text-xs font-bold text-white">{pct}%</span>
              )}
            </div>
          </div>
          {pct < 10 && current > 0 && (
            <p className="mt-2 text-center text-sm text-gray-400">{pct}%</p>
          )}
        </div>
      </section>

      <section className="text-center">
        {donationUrl ? (
          <a
            href={donationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-2xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700"
          >
            Faire un don
          </a>
        ) : (
          <div className="group relative inline-block">
            <button
              disabled
              className="rounded-2xl bg-gray-300 px-10 py-4 text-lg font-semibold text-white cursor-not-allowed"
            >
              Faire un don
            </button>
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white opacity-0 transition group-hover:opacity-100">
              Lien bientôt disponible
            </span>
          </div>
        )}
        <p className="mt-4 text-sm text-gray-400">
          100% des dons vont directement à «&nbsp;Le souci des nôtres&nbsp;»
        </p>
      </section>
    </main>
  )
}
