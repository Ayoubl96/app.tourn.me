'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import UserAuthForm from './user-auth-form';
import { Logo } from '@/components/ui/logo';

export default function SignInViewPage({ stars }: { stars?: number }) {
  const t = useTranslations('Auth');

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/examples/authentication'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 hidden md:right-8 md:top-8'
        )}
      >
        {t('login')}
      </Link>
      <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
        <div className='absolute inset-0 bg-zinc-900' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Logo width={120} height={32} className='mr-2' />
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>&ldquo;{t('testimonial')}&rdquo;</p>
            <footer className='text-sm'>{t('author')}</footer>
          </blockquote>
        </div>
      </div>
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

          <p className='px-8 text-center text-sm text-muted-foreground'>
            {t('termsIntro')}{' '}
            <Link
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              {t('termsOfService')}
            </Link>{' '}
            {t('and')}{' '}
            <Link
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              {t('privacyPolicy')}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
