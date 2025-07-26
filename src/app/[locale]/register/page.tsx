import { Metadata } from 'next';
import RegistrationViewPage from '@/features/auth/components/registration-view';
import { notFound } from 'next/navigation';
import { locales } from '@/config/locales';
import { unstable_setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Create Account | tourn.me',
  description:
    'Create your company account to start managing tournaments with tourn.me'
};

// Generate static params for locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: PageProps) {
  // Await params and validate locale
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering by setting the request locale
  unstable_setRequestLocale(locale);

  return <RegistrationViewPage />;
}
