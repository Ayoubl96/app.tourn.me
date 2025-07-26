'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { ModeToggle } from '@/components/mode-toggle';

interface AuthHeaderProps {
  /**
   * The type of auth page to determine which navigation link to show
   */
  variant: 'signin' | 'register' | 'forgot-password';
}

export default function AuthHeader({ variant }: AuthHeaderProps) {
  const t = useTranslations('Auth');

  const getNavigationLink = () => {
    switch (variant) {
      case 'signin':
        return {
          href: '/register',
          text: t('register') || 'Register'
        };
      case 'register':
        return {
          href: '/signin',
          text: t('login') || 'Sign In'
        };
      case 'forgot-password':
        return {
          href: '/signin',
          text: t('login') || 'Sign In'
        };
    }
  };

  const navigationLink = getNavigationLink();

  return (
    <div className='absolute right-4 top-4 flex items-center gap-2 md:right-8 md:top-8'>
      {/* Theme Toggle */}
      <ModeToggle />

      {/* Navigation Link */}
      <Link
        href={navigationLink.href}
        className={cn(buttonVariants({ variant: 'ghost' }), 'hidden md:flex')}
      >
        {navigationLink.text}
      </Link>
    </div>
  );
}
