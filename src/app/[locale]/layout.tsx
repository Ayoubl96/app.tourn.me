import { NextIntlClientProvider } from 'next-intl';
import { locales, defaultLocale } from '@/config/locales';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { notFound } from 'next/navigation';
import '../globals.css';

export const metadata: Metadata = {
  title: 'tourn.me - Tournament Management Platform',
  description:
    'Professional tournament management platform for organizing and managing competitive events'
};

// Generate static params for locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params properly
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering by setting the request locale
  unstable_setRequestLocale(locale);

  // Load messages for the locale
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Error loading messages for locale: ${locale}`, error);
    messages = (await import(`@/messages/en.json`)).default;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NuqsAdapter>
        <Toaster />
        {children}
      </NuqsAdapter>
    </NextIntlClientProvider>
  );
}
