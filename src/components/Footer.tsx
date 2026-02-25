import Link from 'next/link'
import { getSiteSettings } from '@/lib/supabase/queries'

export default async function Footer() {
  const settings = await getSiteSettings()

  const instagramHandle = settings?.instagram_handle ?? ''
  const donationUrl = settings?.donation_url ?? ''
  const instagramUrl = instagramHandle
    ? `https://instagram.com/${instagramHandle}`
    : 'https://instagram.com'

  return (
    <footer className="bg-[#1a1008] text-gray-300 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm">Fait avec ❤️ sur la route</div>
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
                Faire un don
              </a>
            ) : (
              <Link href="/fundraising" className="hover:text-white transition-colors">
                Faire un don
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
