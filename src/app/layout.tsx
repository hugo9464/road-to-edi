import type { Metadata } from 'next';
import { Geist, Lora } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora' });

export const metadata: Metadata = {
  title: 'Objectif Murrayfield — Paris → Edinburgh',
  description:
    'Hugo à vélo de Paris à Edinburgh pour Écosse-France à Murrayfield, au profit de Le Souci des Nôtres.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let locale = 'fr';
  try {
    locale = await getLocale();
  } catch {}

  return (
    <html lang={locale}>
      <body className={`${geist.variable} ${lora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
