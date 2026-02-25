'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/map', label: 'Carte' },
  { href: '/fundraising', label: 'Soutenir' },
  { href: '/about', label: 'À propos' },
];

export default function Navbar() {
  const pathname = usePathname();

  // SPA home page: no navbar
  if (pathname === '/') return null;

  return (
    <nav className="sticky top-0 z-50 bg-[#fdf8f0]/90 backdrop-blur-sm border-b border-[#d9cdb8] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="font-bold text-lg text-amber-800 hover:text-amber-900">
            Objectif Murrayfield
          </Link>

          {/* Desktop nav */}
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
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex gap-1 pb-2 overflow-x-auto">
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
        </div>
      </div>
    </nav>
  );
}
