'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useT, useLanguage } from '@/contexts/LanguageContext'

export default function Navbar() {
  const pathname = usePathname()
  const t = useT()
  const { lang, toggleLang } = useLanguage()

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/map', label: t.nav.map },
    { href: '/fundraising', label: t.nav.support },
    { href: '/about', label: t.nav.about },
  ]

  // SPA home page: no navbar
  if (pathname === '/') return null

  return (
    <nav className="sticky top-0 z-50 bg-[#fdf8f0]/90 backdrop-blur-sm border-b border-[#d9cdb8] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="font-bold text-lg text-amber-800 hover:text-amber-900">
            {t.nav.brand}
          </Link>

          {/* Desktop nav + lang switcher */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-amber-50 text-amber-800'
                    : 'text-[#7a6550] hover:text-amber-800 hover:bg-[#f0e8d8]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleLang}
              className="ml-2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 shadow-sm text-stone-700 text-xs font-bold hover:bg-white hover:scale-105 transition-all duration-200 border border-stone-200"
              aria-label="Switch language"
            >
              <span className={lang === 'fr' ? 'text-stone-900' : 'text-stone-400'}>FR</span>
              <span className="text-stone-300">|</span>
              <span className={lang === 'en' ? 'text-stone-900' : 'text-stone-400'}>EN</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex gap-1 pb-2 overflow-x-auto items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-amber-800 text-amber-50'
                  : 'bg-[#f0e8d8] text-[#7a6550]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={toggleLang}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-stone-700 text-xs font-bold border border-stone-200"
          >
            <span className={lang === 'fr' ? 'text-stone-900' : 'text-stone-400'}>FR</span>
            <span className="text-stone-300">|</span>
            <span className={lang === 'en' ? 'text-stone-900' : 'text-stone-400'}>EN</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
