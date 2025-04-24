'use client';

import { fetchWithTokenRefresh } from '@/lib/refreshTokenClient';
import { apiClient } from './apiClient';

/**
 * Client-side version of apiClient that handles token refresh and 401 errors
 * This can only be used in client components
 */
export async function clientApiClient(
  endpoint: string,
  init?: RequestInit
): Promise<Response> {
  // Ensure endpoint starts with '/'
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  const fullUrl = `${baseUrl}${normalizedEndpoint}`;

  // Use fetchWithTokenRefresh for client-side token refresh handling
  return fetchWithTokenRefresh(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });
}
