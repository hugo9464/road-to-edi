import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: Request) {
  const body = await request.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('site_settings')
    .upsert({
      id: 1,
      journey_start_date: body.journey_start_date,
      total_distance_km: body.total_distance_km,
      instagram_handle: body.instagram_handle,
      donation_url: body.donation_url,
      fundraising_goal: body.fundraising_goal,
      fundraising_current: body.fundraising_current,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ settings: data })
}
