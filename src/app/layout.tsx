import { auth } from '@/lib/auth';
import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'tourn.me - Tournament Management Platform',
    template: '%s | tourn.me'
  },
  description:
    'Professional tournament management platform for organizing and managing competitive events',
  keywords: [
    'tournament',
    'management',
    'competition',
    'sports',
    'esports',
    'bracket'
  ],
  authors: [{ name: 'tourn.me Team' }],
  creator: 'tourn.me',
  publisher: 'tourn.me',
  openGraph: {
    title: 'tourn.me - Tournament Management Platform',
    description:
      'Professional tournament management platform for organizing and managing competitive events',
    url: 'https://tourn.me',
    siteName: 'tourn.me',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'tourn.me - Tournament Management Platform',
    description:
      'Professional tournament management platform for organizing and managing competitive events'
  },
  robots: {
    index: true,
    follow: true
  }
};

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang='en' className={`${lato.className}`} suppressHydrationWarning>
      <body className={'overflow-hidden'}>
        <NextTopLoader showSpinner={false} />
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
