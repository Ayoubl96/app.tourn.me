'use client';

import { signOut as nextAuthSignOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { locales, defaultLocale } from '@/config/locales';

/**
 * Secure logout function that clears tokens from browser cookies
 * and redirects user to homepage while preserving the current locale
 */
export async function secureLogout({
  callbackUrl
}: { callbackUrl?: string } = {}) {
  try {
    // Get the current path to extract the locale
    const pathname = window.location.pathname;

    // Extract the locale from the current path
    const currentLocale =
      locales.find(
        (locale) =>
          pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
      ) || defaultLocale;

    // Set the redirect URL to preserve the locale
    const redirectUrl =
      callbackUrl ||
      (currentLocale === defaultLocale ? '/' : `/${currentLocale}`);

    // Perform client-side logout through NextAuth
    // This will clear the session and redirect the user
    await nextAuthSignOut({ callbackUrl: redirectUrl });
  } catch (error) {
    console.error('Error during logout:', error);
    // Try again in case of an error
    try {
      await nextAuthSignOut({ callbackUrl: '/' });
    } catch (secondError) {
      console.error('Second attempt at logout failed:', secondError);
      // Last resort - redirect to home page
      window.location.href = '/';
    }
  }
}
