import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Road to Edi - GPS Tracker',
  description: 'GPS tracker for the Road to Edinburgh cycling journey',
  manifest: '/manifest.json',
  other: {
    'theme-color': '#1a1a2e',
  },
}

export default function PWALayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
