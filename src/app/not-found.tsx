'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { defaultLocale } from '@/config/locales';
import { useSession } from 'next-auth/react';

export default function NotFound() {
  // Use useSession to check if user is authenticated
  const { data: session, status } = useSession();

  // Determine the redirect path based on authentication status
  const redirectPath = session ? '/dashboard' : `/${defaultLocale}`;

  return (
    <div className='absolute left-1/2 top-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center'>
      <div className='space-y-4'>
        <h1 className='text-4xl font-bold'>Page Not Found</h1>
        <p className='text-muted-foreground'>
          Sorry, the page you are looking for doesn&apos;t exist or has been
          moved.
        </p>
        <Button asChild>
          <Link href={redirectPath}>
            {session ? 'Go to Dashboard' : 'Return to Login'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
