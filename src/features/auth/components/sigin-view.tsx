'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import UserAuthForm from './user-auth-form';
import AuthSideImage from './auth-side-image';
import AuthHeader from './auth-header';
import TermsAndPrivacyLinks from './terms-and-privacy-links';

export default function SignInViewPage({ stars }: { stars?: number }) {
  const t = useTranslations('Auth');

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <AuthHeader variant='signin' />
      <AuthSideImage />
      <div className='flex h-full items-center p-4 lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              {t('createAccount')}
            </h1>
            <p className='text-sm text-muted-foreground'>{t('enterEmail')}</p>
          </div>
          <UserAuthForm />

          {/* Registration CTA Section */}
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>
                {t('dontHaveAccount')}
              </span>
            </div>
          </div>

          <div className='space-y-4 text-center'>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-primary'>
                {t('createAccountToday')}
              </h3>
              <p className='text-sm text-muted-foreground'>
                {t('joinTournamentPlatform')}
              </p>
            </div>
            <Link
              href='/register'
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
            >
              {t('signUpNow')}
            </Link>
          </div>

          <TermsAndPrivacyLinks translationPrefix='' />
        </div>
      </div>
    </div>
  );
}
