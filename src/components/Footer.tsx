import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getSiteSettings } from '@/lib/supabase/queries'

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'footer' })
  const settings = await getSiteSettings()

  const instagramHandle = settings?.instagram_handle ?? ''
  const donationUrl = settings?.donation_url ?? ''
  const instagramUrl = instagramHandle
    ? `https://instagram.com/${instagramHandle}`
    : 'https://instagram.com'

  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm">{t('madeWith')}</div>
          <div className="flex items-center gap-6 text-sm">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              📸 {instagramHandle ? `@${instagramHandle}` : t('instagram')}
            </a>
            {donationUrl ? (
              <a
                href={donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                💙 {t('donate')}
              </a>
            ) : (
              <Link href="/fundraising" className="hover:text-white transition-colors">
                💙 {t('donate')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
