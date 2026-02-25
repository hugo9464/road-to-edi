# Objectif Murrayfield — Setup Guide

## Services to configure before going live

### 1. Sanity CMS (blog & settings)

1. Go to [sanity.io](https://sanity.io) → create a free account
2. Create a new project → choose "Empty" → name it "Objectif Murrayfield"
3. Note your **Project ID** (shown on dashboard)
4. Go to **API** → create a **Read** token (for ISR) and a **Write** token (for future use)
5. Deploy Studio: `cd sanity && npx sanity@latest deploy` → choose `road-to-edi` as subdomain
6. Studio will be available at `https://road-to-edi.sanity.studio`

### 2. Supabase (GPS tracking)

1. Go to [supabase.com](https://supabase.com) → create a free account
2. Create new project → name "road-to-edi"
3. Go to **SQL Editor** → run the contents of `supabase-schema.sql`
4. Go to **Settings → API** → note your **Project URL** and **anon public key**

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...
SANITY_WEBHOOK_SECRET=choose-a-random-string

NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

NEXT_PUBLIC_PWA_PIN=1234   # choose your own PIN
```

### 4. Vercel Deployment

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project from GitHub
3. Add all environment variables from `.env.local` to Vercel's project settings
4. Deploy!

### 5. Sanity Webhook (instant blog updates)

After deploying to Vercel, add a webhook in Sanity:
- **Sanity project → API → Webhooks → Add webhook**
- URL: `https://your-site.vercel.app/api/revalidate`
- Secret: the value of `SANITY_WEBHOOK_SECRET`
- Trigger on: Create, Update, Delete

---

## Mobile usage

### Posting a blog article from your phone
1. Open `https://road-to-edi.sanity.studio` in your phone browser
2. Login with your Sanity account
3. Create a new Post → fill in title, day, location, body, photo → Publish

### GPS tracker (PWA)
1. Open `https://your-site.vercel.app/pwa` in Safari (iPhone) or Chrome (Android)
2. iOS: Tap Share → "Add to Home Screen" → "Add"
3. Android: Tap menu → "Add to Home Screen"
4. Enter your PIN, grant location permission
5. Keep the app open while cycling → sends position every 5 minutes

### Updating fundraising progress
1. Open Sanity Studio → Settings → update `fundraisingCurrent`
2. The thermometer on `/fundraising` updates automatically

### Adding the donation link (HelloAsso)
1. Create your HelloAsso page at [helloasso.com](https://helloasso.com)
2. Copy the URL
3. Open Sanity Studio → Settings → paste URL in `donationUrl`

---

## Route GeoJSON

The cycling route is pre-loaded in `public/data/route.geojson`. It shows the
approximate Paris → Edinburgh route via Calais → Dover → London → Cambridge →
York → Edinburgh.

If you export your actual route from Komoot or Strava, replace this file with
your exported GeoJSON (must be a LineString with `[lng, lat]` coordinates).
