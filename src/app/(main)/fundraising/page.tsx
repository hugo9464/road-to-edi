import { getSiteSettings } from '@/lib/supabase/queries'
import FundraisingView from './FundraisingView'

export const dynamic = 'force-dynamic'

export default async function FundraisingPage() {
  const settings = await getSiteSettings()

  const goal = settings?.fundraising_goal ?? 5000
  const current = settings?.fundraising_current ?? 0
  const donationUrl = settings?.donation_url || 'https://www.helloasso.com/associations/le-souci-des-notres/formulaires/1'
  const pct = Math.min(100, Math.round((current / goal) * 100))

  return (
    <FundraisingView
      goal={goal}
      current={current}
      donationUrl={donationUrl}
      pct={pct}
    />
  )
}
