import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Road to Edi — Paris → Edinburgh',
  description:
    'Hugo cycling from Paris to Edinburgh for Scotland vs France at Murrayfield, raising funds for Le souci des nôtres.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
