import type { Metadata } from 'next';
import { Geist, Lora } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora' });

export const metadata: Metadata = {
  title: {
    template: '%s | Objectif Murrayfield',
    default: 'Objectif Murrayfield — Paris → Edinburgh',
  },
  description:
    'Hugo à vélo de Paris à Edinburgh pour Écosse-France à Murrayfield, au profit de Le Souci des Nôtres.',
  openGraph: {
    siteName: 'Objectif Murrayfield',
    type: 'website',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${geist.variable} ${lora.variable} antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
