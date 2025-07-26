'use client';

import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';

interface TermsAndPrivacyLinksProps {
  translationPrefix?: string;
  className?: string;
}

export default function TermsAndPrivacyLinks({
  translationPrefix = 'Auth',
  className = 'px-8 text-center text-sm text-muted-foreground'
}: TermsAndPrivacyLinksProps) {
  const t = useTranslations();

  // Check if terms and privacy links should be displayed via environment variable
  const showTermsAndPrivacy =
    process.env.NEXT_PUBLIC_SHOW_TERMS_AND_PRIVACY !== 'false';

  if (!showTermsAndPrivacy) {
    return null;
  }

  const getTranslationKey = (key: string) => {
    return translationPrefix ? `${translationPrefix}.${key}` : key;
  };

  return (
    <p className={className}>
      {t(getTranslationKey('termsIntro'))}{' '}
      <Link
        href='/terms'
        className='underline underline-offset-4 hover:text-primary'
      >
        {t(getTranslationKey('termsOfService'))}
      </Link>{' '}
      {t(getTranslationKey('and'))}{' '}
      <Link
        href='/privacy'
        className='underline underline-offset-4 hover:text-primary'
      >
        {t(getTranslationKey('privacyPolicy'))}
      </Link>
      .
    </p>
  );
}
