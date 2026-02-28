'use client'

import Link from 'next/link'
import { useT, useLanguage } from '@/contexts/LanguageContext'

interface FundraisingViewProps {
  goal: number
  current: number
  donationUrl: string
  pct: number
}

export default function FundraisingView({ goal, current, donationUrl, pct }: FundraisingViewProps) {
  const t = useT()
  const { lang } = useLanguage()

  const locale = lang === 'en' ? 'en-GB' : 'fr-FR'
  const fmt = (n: number) => n.toLocaleString(locale)

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">{t.fundraising.title}</h1>
        <p className="text-lg text-gray-500">{t.fundraising.subtitle}</p>
      </section>

      <section className="mb-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8">
        <h2 className="mb-3 text-2xl font-semibold">{t.fundraising.assocTitle}</h2>
        <div className="space-y-3 text-gray-700">
          <p>{t.fundraising.assocPara1}</p>
          <p>{t.fundraising.assocPara2}</p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-center">{t.fundraising.progress}</h2>
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
            {t.fundraising.donate}
          </a>
        ) : (
          <div className="group relative inline-block">
            <button
              disabled
              className="rounded-2xl bg-gray-300 px-10 py-4 text-lg font-semibold text-white cursor-not-allowed"
            >
              {t.fundraising.donate}
            </button>
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white opacity-0 transition group-hover:opacity-100">
              {t.fundraising.comingSoon}
            </span>
          </div>
        )}
        <p className="mt-4 text-sm text-gray-400">{t.fundraising.disclaimer}</p>
      </section>
    </main>
  )
}
