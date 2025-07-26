import { redirect } from '@/lib/navigation';
import { auth } from '@/lib/auth';
import { defaultLocale, locales } from '@/config/locales';
import { unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

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

  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  } else {
    redirect('/signin');
  }
}
