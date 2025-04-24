'use client';

import { getSession } from 'next-auth/react';
import { refreshToken } from '@/api/auth';
import { locales, defaultLocale } from '@/config/locales';
import { secureLogout } from './secureLogout';

// Track refresh promise to avoid multiple concurrent refresh requests
let refreshPromise: Promise<string | null> | null = null;

/**
 * Fetch wrapper that handles token refresh
 * - Automatically refreshes the token when it receives a 401
 * - Ensures concurrent requests don't trigger multiple refreshes
 * - Retries the original request with the new token
 * - Forces logout if refresh fails, preserving current locale
 */
export async function fetchWithTokenRefresh(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  // First attempt with current token
  const response = await fetch(input, init);

  // If not 401, just return the response
  if (response.status !== 401) {
    return response;
  }

  // If 401, try to refresh the token
  try {
    // Get the new token, either from an existing refresh operation or by starting a new one
    const newToken = await refreshAccessToken();

    // If we couldn't get a new token, force logout
    if (!newToken) {
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
        currentLocale === defaultLocale ? '/' : `/${currentLocale}`;

      secureLogout({ callbackUrl: redirectUrl });
      return response; // Return original 401 response
    }

    // Clone the original request but with the new token
    const newInit = { ...init } as RequestInit;
    const newHeaders = new Headers(init?.headers || {});
    newHeaders.set('Authorization', `Bearer ${newToken}`);
    newInit.headers = newHeaders;

    // Retry the request with the new token
    return fetch(input, newInit);
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Default fallback to root in case of error
    secureLogout({ callbackUrl: '/' });
    return response; // Return original 401 response
  }
}

/**
 * Refreshes the access token using the refresh token
 * Ensures only one refresh operation happens at a time
 */
async function refreshAccessToken(): Promise<string | null> {
  // If we're already refreshing, return that promise
  if (refreshPromise) {
    return refreshPromise;
  }

  // Start a new refresh operation
  refreshPromise = (async () => {
    try {
      const session = await getSession();

      if (!session?.refreshToken) {
        console.error('No refresh token available');
        return null;
      }

      // Call the API to refresh the token
      const result = await refreshToken(session.refreshToken);

      // Force session update in NextAuth - this is a workaround, as NextAuth doesn't
      // provide a direct method to update the token in storage
      // The token will be properly updated on the next navigation or page refresh

      return result.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    } finally {
      // Clear the promise so future calls will try again
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
