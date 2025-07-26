import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sigin-view';
import { notFound } from 'next/navigation';
import { locales } from '@/config/locales';
import { unstable_setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title:
    'Tourn.me | trasforma la gestione dei tornei di padel: crea tornei personalizzati, abbina i giocatori in base al loro livello e automatizza tutto il resto. Più semplicità, maggiore efficienza e zero stress per te!',
  description:
    'trasforma la gestione dei tornei di padel: crea tornei personalizzati, abbina i giocatori in base al loro livello e automatizza tutto il resto. Più semplicità, maggiore efficienza e zero stress per te!'
};

// Generate static params for locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  // Await params and validate locale
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering by setting the request locale
  unstable_setRequestLocale(locale);

  let stars = 3000; // Default value

  return <SignInViewPage stars={stars} />;
}
