'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useT } from '@/contexts/LanguageContext'
import type { SiteSettings } from '@/lib/supabase/types'

export default function Footer() {
  const t = useT()
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    async function load() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      setSettings(data)
    }
    load()
  }, [])

  const instagramHandle = settings?.instagram_handle ?? ''
  const donationUrl = settings?.donation_url || 'https://www.helloasso.com/associations/le-souci-des-notres/formulaires/1'
  const instagramUrl = instagramHandle
    ? `https://instagram.com/${instagramHandle}`
    : 'https://instagram.com'

  return (
    <footer className="bg-[#1a1008] text-gray-300 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm">{t.footer.madeWith}</div>
          <div className="flex items-center gap-6 text-sm">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              {instagramHandle ? `@${instagramHandle}` : 'Instagram'}
            </a>
            {donationUrl ? (
              <a
                href={donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                {t.footer.donate}
              </a>
            ) : (
              <Link href="/fundraising" className="hover:text-white transition-colors">
                {t.footer.donate}
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
