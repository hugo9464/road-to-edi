import type { Metadata } from 'next';
import { Geist, Lora } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora' });

export const metadata: Metadata = {
  title: 'Road to Edi — Paris → Edinburgh',
  description:
    'Hugo cycling from Paris to Edinburgh for Scotland vs France at Murrayfield, raising funds for Le souci des nôtres.',
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
