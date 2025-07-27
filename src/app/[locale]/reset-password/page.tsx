import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales } from '@/config/locales';
import { unstable_setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import ResetPasswordTokenView from '@/features/auth/components/reset-password-token-view';

// Generate static params for locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PasswordReset' });

  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function ResetPasswordPage({
  params,
  searchParams
}: PageProps) {
  // Await params and validate locale
  const { locale } = await params;
  const { token } = await searchParams;

  // Validate that the incoming locale is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering by setting the request locale
  unstable_setRequestLocale(locale);

  return <ResetPasswordTokenView token={token} />;
}
