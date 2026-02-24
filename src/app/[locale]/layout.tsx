import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    template: '%s | Road to Edi',
    default: 'Road to Edi — Paris → Edinburgh',
  },
  description:
    'Hugo cycling from Paris to Edinburgh for Scotland vs France at Murrayfield, raising funds for Le souci des nôtres.',
  openGraph: {
    siteName: 'Road to Edi',
    type: 'website',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  manifest: '/manifest.json',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'fr' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="font-sans flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
      </div>
      <Analytics />
    </NextIntlClientProvider>
  );
}
